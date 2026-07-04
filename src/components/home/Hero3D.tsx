'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Hero3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const directLight1 = new THREE.DirectionalLight(0xd4af37, 2.5); // Gold light
    directLight1.position.set(5, 5, 5);
    scene.add(directLight1);

    const directLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
    directLight2.position.set(-5, 3, -5);
    scene.add(directLight2);

    const pointLight = new THREE.PointLight(0xd4af37, 2, 10);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // Phone Group
    const phoneGroup = new THREE.Group();

    // Phone Body Geometry (Box with rounded edges simulation)
    const bodyGeom = new THREE.BoxGeometry(2.8, 5.5, 0.25);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x121212,
      metalness: 0.9,
      roughness: 0.15,
      name: 'PhoneChassis',
    });
    const phoneBody = new THREE.Mesh(bodyGeom, bodyMat);
    phoneGroup.add(phoneBody);

    // Gold Bumper Trim (Outer frame highlight)
    const bumperGeom = new THREE.BoxGeometry(2.9, 5.6, 0.2);
    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Primary Gold
      metalness: 0.95,
      roughness: 0.08,
    });
    const phoneBumper = new THREE.Mesh(bumperGeom, bumperMat);
    phoneBumper.position.z = -0.02;
    phoneGroup.add(phoneBumper);

    // Front Screen Panel
    const screenGeom = new THREE.BoxGeometry(2.7, 5.4, 0.02);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      metalness: 0.8,
      roughness: 0.05,
    });
    const phoneScreen = new THREE.Mesh(screenGeom, screenMat);
    phoneScreen.position.z = 0.13;
    phoneGroup.add(phoneScreen);

    // Gold Camera Bump on back
    const cameraBumpGeom = new THREE.BoxGeometry(1.2, 1.2, 0.1);
    const cameraBumpMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.1,
    });
    const cameraBump = new THREE.Mesh(cameraBumpGeom, cameraBumpMat);
    cameraBump.position.set(0.6, 1.8, -0.15);
    phoneGroup.add(cameraBump);

    // Camera Lenses
    for (let i = 0; i < 3; i++) {
      const lensGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
      const lensMat = new THREE.MeshStandardMaterial({
        color: 0x080808,
        metalness: 0.95,
        roughness: 0.02,
      });
      const lens = new THREE.Mesh(lensGeom, lensMat);
      lens.rotation.x = Math.PI / 2;
      
      const xOffset = i === 0 ? 0.35 : i === 1 ? 0.85 : 0.6;
      const yOffset = i === 0 ? 2.1 : i === 1 ? 2.1 : 1.5;
      
      lens.position.set(xOffset, yOffset, -0.21);
      phoneGroup.add(lens);
    }

    scene.add(phoneGroup);

    // Floating Ambient Gold Particles
    const particlesCount = 80;
    const particlesGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 5;
    }

    particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle material
    const particleMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeom, particleMat);
    scene.add(particles);

    setLoading(false);

    // Mouse Tracking for dynamic tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = (x / width) - 0.5;
      mouseY = (y / height) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let reqId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Autopilot rotation when mouse is idle
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      phoneGroup.rotation.y = elapsedTime * 0.3 + targetX * 1.5;
      phoneGroup.rotation.x = targetY * 1.5 + Math.sin(elapsedTime * 0.5) * 0.1;
      
      // Floating animation
      phoneGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.15;

      // Rotate background particles
      particles.rotation.y = elapsedTime * 0.05;
      particles.rotation.x = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
export default Hero3D;
