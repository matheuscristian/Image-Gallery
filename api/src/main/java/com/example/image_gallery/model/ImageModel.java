package com.example.image_gallery.model;

import java.time.LocalDate;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.GenerationType;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "image")
@Getter
@Setter
@NoArgsConstructor
public class ImageModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = true, length = 255)
    private String author;

    @Column(unique = true, nullable = false, length = 255)
    private String url;

    @CreatedDate
    @Column(name = "create_time", updatable = false, nullable = false)
    private LocalDate createTime;
}
