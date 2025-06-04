package com.example.image_gallery.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.image_gallery.model.ImageModel;

@Repository
public interface ImageRepository extends JpaRepository<ImageModel, Long> {

}
