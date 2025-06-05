import Swal from "sweetalert2";
import Masonry from "masonry-layout";

import trash from "./svg/trash.svg?raw";

const addButton = document.getElementById("add-btn");
if (!addButton) {
  throw new Error("Couldn't find the add button");
}

addButton.addEventListener("click", async () => {
  const swalResponse = await Swal.fire({
    title: "Adicionar imagem",
    html: `
      <div class="flex flex-col items-center w-full gap-3">
        <div class="flex flex-col text-left gap-3 w-[80%]">
          <label>Autor</label>
          <input id="author-input" type="text" name="name" class="swal2-input !m-0 w-full" />
        </div>
        <div class="flex flex-col text-left gap-3 w-[80%]">
          <label>URL</label>
          <input id="url-input" type="url" name="url" class="swal2-input !m-0 w-full" />
        </div>
      </div>
    `,
    focusConfirm: false,
    confirmButtonText: "Adicionar",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    preConfirm() {
      return [
        (document.getElementById("url-input") as HTMLInputElement).value,
        (document.getElementById("author-input") as HTMLInputElement).value,
      ];
    },
  });

  if (!swalResponse.isConfirmed) return;

  if (!swalResponse.value[0] || !swalResponse.value[1]) {
    Swal.fire("Erro", "O autor e a URL são obrigatórios!", "error");
    return;
  }

  fetch("/api/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: swalResponse.value[0],
      author: swalResponse.value[1] || null,
    }),
  })
    .then((data) => data.json())
    .then((res: { url: string; author?: string; id: number }) => {
      addImage({ url: res.url, author: res.author || "", id: res.id });
    })
    .catch((err) => {
      Swal.fire(
        "Erro",
        "Ocorreu um erro ao tentar adicionar a imagem",
        "error"
      );
      console.error(err);
    });
});

fetch("/api/image")
  .then((data) => data.json())
  .then((res: { url: string; author?: string; id: number }[]) => {
    res.forEach((entry) => {
      addImage({ url: entry.url, author: entry.author || "", id: entry.id });
    });
  })
  .catch((err) => {
    Swal.fire("Erro", "Não foi possível carregar as imagens", "error");
    console.error(err);
  });

function reloadMasonry() {
  new Masonry("#masonry", {
    itemSelector: ".masonry-item",
    columnWidth: ".masonry-item",
    gutter: 10,
    fitWidth: true,
    horizontalOrder: true,
  });
}

function addImage({
  url,
  author,
  id,
}: {
  url: string;
  author: string;
  id: number;
}) {
  const masonry = document.getElementById("masonry");
  if (!masonry || !url) return;

  if (author.length > 35) {
    author = author.slice(0, 36) + "...";
  }

  const newImage = document.createElement("div");
  newImage.id = id.toString();
  newImage.className = "masonry-item overflow-hidden";
  newImage.innerHTML = `
    <div class="absolute flex justify-end items-end w-full p-5 h-full opacity-0 hover:opacity-100 z-1">
      <button class="delete-btn hover:cursor-pointer transition-all active:scale-95 duration-75 hover:bg-red-600 size-7 bg-red-500 rounded-md"><div class="size-5 mx-auto">${trash}</div></button>
    </div>
    <span class="absolute text-white text-shadow-2xs font-thin text-nowrap italic w-full px-3 pt-1">${author}</span>
    <img src="${url}" />
  `;

  newImage
    .querySelector("button")
    ?.addEventListener("click", () => deleteImage(id));

  masonry.appendChild(newImage);

  reloadMasonry();
}

function deleteImage(id: number) {
  fetch(`/api/image/${id}`, {
    method: "DELETE",
  })
    .then((data) => {
      if (data.ok) {
        document.getElementById(id.toString())?.remove();
        reloadMasonry();
      } else {
        throw new Error("Não foi possível deletar a imagem");
      }
    })
    .catch((err) => {
      Swal.fire("Erro", "Não foi possível deletar a imagem", "error");
      console.error(err);
    });
}
