const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => observer.observe(item));

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 8}deg) rotateX(${y * -7}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

const form = document.getElementById("contactForm");
const statusNode = document.getElementById("formStatus");

if (form && statusNode) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name")?.toString().trim() || "there";
    statusNode.textContent = `Got it, ${name}. Your project brief is ready to turn into a build.`;
    form.reset();
  });
}

const yearNode = document.getElementById("year");
if (yearNode) yearNode.textContent = new Date().getFullYear();

document.querySelectorAll("img[data-photo]").forEach((image) => {
  const photoPath = image.getAttribute("data-photo");
  if (!photoPath) return;

  const candidate = new Image();
  candidate.addEventListener("load", () => {
    image.src = photoPath;
  });
  candidate.src = photoPath;
});

const canvas = document.getElementById("spaceCanvas");

if (canvas) {
  import("https://unpkg.com/three@0.165.0/build/three.module.js")
    .then((module) => initSpaceScene(module))
    .catch(() => {
      canvas.style.display = "none";
    });
}

function initSpaceScene(THREE) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.6, 7.2);

  const group = new THREE.Group();
  scene.add(group);

  const page = document.body.dataset.page || "home";
  const colorMap = {
    home: [0x4df4ff, 0xff4fd8],
    about: [0xa8ff60, 0x4df4ff],
    services: [0x4b7dff, 0x4df4ff],
    projects: [0xff4fd8, 0x4b7dff],
    personal: [0xa8ff60, 0x4b7dff],
    lab: [0x4df4ff, 0xa8ff60],
    process: [0xa8ff60, 0xff4fd8],
    contact: [0xff4fd8, 0x4df4ff],
  };
  const [primaryColor, secondaryColor] = colorMap[page] || colorMap.home;

  const coreGeometry = new THREE.IcosahedronGeometry(1.1, 2);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: primaryColor,
    metalness: 0.32,
    roughness: 0.18,
    emissive: primaryColor,
    emissiveIntensity: 0.16,
    wireframe: true,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: secondaryColor,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
  });

  for (let index = 0; index < 3; index += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.85 + index * 0.45, 0.012, 16, 160), ringMaterial.clone());
    ring.rotation.x = Math.PI / (2.2 + index * 0.22);
    ring.rotation.y = index * 0.72;
    ring.material.opacity = 0.48 - index * 0.1;
    group.add(ring);
  }

  const nodeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4f7fb,
    emissive: secondaryColor,
    emissiveIntensity: 0.2,
    metalness: 0.4,
    roughness: 0.25,
  });

  for (let index = 0; index < 18; index += 1) {
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (index % 3) * 0.012, 16, 16), nodeMaterial);
    const angle = index * 0.82;
    const radius = 2.25 + (index % 5) * 0.28;
    node.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.7) * 0.9, Math.sin(angle) * radius);
    group.add(node);
  }

  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = 900;
  const positions = new Float32Array(particleCount * 3);

  for (let index = 0; index < particleCount; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 18;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[index * 3 + 2] = (Math.random() - 0.5) * 14;
  }

  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.018,
      transparent: true,
      opacity: 0.52,
    })
  );
  scene.add(particles);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));

  const lightA = new THREE.PointLight(primaryColor, 4.5, 14);
  lightA.position.set(3, 2.6, 3.8);
  scene.add(lightA);

  const lightB = new THREE.PointLight(secondaryColor, 3.2, 12);
  lightB.position.set(-3.4, -1.7, 3.2);
  scene.add(lightB);

  const pointer = { x: 0, y: 0 };
  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  function animate() {
    const elapsed = clock.getElapsedTime();
    const scrollRatio = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);

    group.rotation.x = elapsed * 0.13 + pointer.y * 0.12;
    group.rotation.y = elapsed * 0.18 + pointer.x * 0.18 + scrollRatio * 1.2;
    group.position.x = pointer.x * 0.22;
    group.position.y = -0.25 + pointer.y * -0.16;

    core.rotation.x = elapsed * 0.42;
    core.rotation.z = elapsed * 0.22;
    particles.rotation.y = elapsed * 0.018;
    particles.rotation.x = pointer.y * 0.03;

    camera.position.z = 7.2 - scrollRatio * 1.1;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
