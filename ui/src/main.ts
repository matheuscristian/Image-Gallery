import Swal from "sweetalert2";
import Masonry from "masonry-layout";

import trash from "./svg/trash.svg?raw";
import edit from "./svg/edit.svg?raw";

const addButton = document.getElementById("add-btn");
if (!addButton) {
  throw new Error("Couldn't find the add button");
}

function getImageInput(title: string, defAuthor?: string, defURL?: string) {
  return Swal.fire({
    title,
    html: `
      <div class="flex flex-col items-center w-full gap-3">
        <div class="flex flex-col text-left gap-3 w-[80%]">
          <label>Autor</label>
          <input id="author-input" value="${
            defAuthor ?? ""
          }" type="text" name="name" class="swal2-input !m-0 w-full" />
        </div>
        <div class="flex flex-col text-left gap-3 w-[80%]">
          <label>URL</label>
          <input id="url-input" value="${
            defURL ?? ""
          }" type="url" name="url" class="swal2-input !m-0 w-full" />
        </div>
      </div>
    `,
    focusConfirm: false,
    confirmButtonText: "Adicionar",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    preConfirm() {
      const urlInput = document.getElementById(
        "url-input"
      ) as HTMLInputElement | null;
      const authorInput = document.getElementById(
        "author-input"
      ) as HTMLInputElement | null;

      if (!urlInput || !authorInput) {
        Swal.showValidationMessage("Inputs não encontrados");
        return null;
      }

      return [urlInput.value, authorInput.value] as [string, string];
    },
  });
}

addButton.addEventListener("click", async () => {
  const swalResponse = await getImageInput("Adicionar Imagem");

  if (!swalResponse.isConfirmed) return;

  const value = swalResponse.value;
  if (
    !value ||
    typeof value[0] !== "string" ||
    typeof value[1] !== "string" ||
    value[0].trim() === "" ||
    value[1].trim() === ""
  ) {
    Swal.fire("Erro", "O autor e a URL são obrigatórios!", "error");
    return;
  }

  fetch("/api/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: value[0].trim(),
      author: value[1].trim() || null,
    }),
  })
    .then((data) => data.json())
    .then((res: { url: string; author: string; id: number }) => {
      addImage({ url: res.url, author: res.author, id: res.id });
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
  .then((res: { url: string; author: string; id: number }[]) => {
    res.forEach((entry) => {
      addImage({ url: entry.url, author: entry.author, id: entry.id });
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

  let displayedAuthor = author;
  if (author.length > 36) {
    displayedAuthor = author.slice(0, 36) + "...";
  }

  const newImage = document.createElement("div");
  newImage.id = id.toString();
  newImage.className = "masonry-item overflow-hidden";
  newImage.innerHTML = `
    <div class="absolute gap-1 flex justify-end items-end w-full p-5 h-full opacity-0 hover:opacity-100 z-1">
      <button class="edit-btn hover:cursor-pointer transition-all active:scale-95 duration-75 hover:bg-yellow-600 size-7 bg-yellow-500 rounded-md"><div class="size-5 mx-auto">${edit}</div></button>
      <button class="delete-btn hover:cursor-pointer transition-all active:scale-95 duration-75 hover:bg-red-600 size-7 bg-red-500 rounded-md"><div class="size-5 mx-auto">${trash}</div></button>
    </div>
    <span class="absolute bg-black/25 text-white text-shadow-2xs font-thin text-nowrap italic w-full px-3 pt-1">${displayedAuthor}</span>
    <img src="${url}" />
  `;

  newImage
    .querySelector<HTMLButtonElement>(".delete-btn")
    ?.addEventListener("click", () => deleteImage(id));

  newImage
    .querySelector<HTMLButtonElement>(".edit-btn")
    ?.addEventListener("click", () => editImage({ url, author, id }));

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

async function editImage({
  url,
  author,
  id,
}: {
  url: string;
  author: string;
  id: number;
}) {
  const swalResponse = await getImageInput("Editar Imagem", author, url);

  if (!swalResponse.isConfirmed) return;

  const value = swalResponse.value;
  if (
    !value ||
    typeof value[0] !== "string" ||
    typeof value[1] !== "string" ||
    value[0].trim() === "" ||
    value[1].trim() === ""
  ) {
    Swal.fire("Erro", "O autor e a URL são obrigatórios!", "error");
    return;
  }

  fetch(`/api/image/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: value[0].trim(),
      author: value[1].trim(),
    }),
  })
    .then((data) => {
      if (data.ok) {
        return data.json();
      }
      throw new Error("Couldn't edit image!");
    })
    .then((res: { url: string; author: string; id: number }) => {
      const resId = res.id;
      const element = document.getElementById(resId.toString());

      if (!element) {
        throw new Error("Imagem não encontrada!");
      }

      const img = element.querySelector<HTMLImageElement>("img");
      if (img) {
        img.src = res.url;
      }

      const span = element.querySelector<HTMLSpanElement>("span");
      if (span) {
        span.textContent =
          res.author.length > 36 ? res.author.slice(0, 36) + "..." : res.author;
      }

      const clone = element.cloneNode(true) as HTMLElement;
      element.parentNode?.replaceChild(clone, element);

      const newElement = document.getElementById(resId.toString());
      newElement
        ?.querySelector<HTMLButtonElement>(".edit-btn")
        ?.addEventListener("click", () =>
          editImage({ url: res.url, author: res.author, id: resId })
        );

      newElement
        ?.querySelector<HTMLButtonElement>(".delete-btn")
        ?.addEventListener("click", () => deleteImage(resId));

      reloadMasonry();
    })
    .catch((err) => {
      Swal.fire("Erro", "Não foi possível editar a imagem", "error");
      console.error(err);
    });
}
