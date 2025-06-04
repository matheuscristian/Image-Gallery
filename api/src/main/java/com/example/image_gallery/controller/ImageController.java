package com.example.image_gallery.controller;

import com.example.image_gallery.model.ImageModel;
import com.example.image_gallery.repository.ImageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/image")
public class ImageController {

    @Autowired
    private ImageRepository repository;

    @GetMapping
    public ResponseEntity<List<ImageModel>> listAll() {
        List<ImageModel> images = repository.findAll();
        return ResponseEntity.ok(images);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ImageModel entity) {
        if (entity.getUrl() == null || entity.getAuthor() == null) {
            return ResponseEntity.badRequest().body("Missing required fields: url or author.");
        }

        entity.setCreateTime(null);

        ImageModel saved = repository.save(entity);
        return ResponseEntity.created(URI.create("/api/image/" + saved.getId())).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return repository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Image with ID " + id + " not found."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateById(@PathVariable Long id, @RequestBody ImageModel updateBody) {
        return repository.findById(id)
                .<ResponseEntity<?>>map(existing -> {
                    if (updateBody.getUrl() != null)
                        existing.setUrl(updateBody.getUrl());
                    if (updateBody.getAuthor() != null)
                        existing.setAuthor(updateBody.getAuthor());

                    updateBody.setCreateTime(existing.getCreateTime());

                    ImageModel updated = repository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> ResponseEntity.status(404).body("Image with ID " + id + " not found."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteById(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.status(404).body("Image with ID " + id + " not found.");
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
