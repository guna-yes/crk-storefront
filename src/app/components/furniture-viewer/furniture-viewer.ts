import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  input,
} from '@angular/core';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// A single neutral "clay study" palette shared by every piece - the point of
// the abstract/sculptural treatment is that form and soft light carry the
// piece, not per-product color. The product's own color is only used as a
// faint accent glow (see `accentLight`), never as the material itself.
const SCULPT_BASE = new THREE.Color(0xcabaa2);
const SCULPT_LIGHT = SCULPT_BASE.clone().lerp(new THREE.Color(0xffffff), 0.22);
const SCULPT_PANEL = SCULPT_BASE.clone().lerp(new THREE.Color(0x2a251f), 0.32);
const SCULPT_LEG = new THREE.Color(0x46403a);

const BEVEL_SEGMENTS = 3;
const BEVEL_RADIUS = 0.045;

@Component({
  selector: 'app-furniture-viewer',
  standalone: true,
  templateUrl: './furniture-viewer.html',
  styleUrl: './furniture-viewer.css',
})
export class FurnitureViewer implements AfterViewInit, OnDestroy {
  category = input<string>('Sofa');
  color = input<string>('#8b5a2b');
  autoRotate = input<boolean>(true);

  @ViewChild('canvasHost', { static: true }) canvasHost!: ElementRef<HTMLDivElement>;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private accentLight?: THREE.PointLight;
  private readonly furnitureGroup = new THREE.Group();
  private frameId = 0;
  private resizeObserver?: ResizeObserver;
  private ready = false;

  constructor() {
    effect(() => {
      const category = this.category();
      const color = this.color();
      if (this.ready) {
        this.buildFurniture(category, color);
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.initScene()) {
      return;
    }
    this.ready = true;
    this.buildFurniture(this.category(), this.color());
    this.animate();
    this.observeResize();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.clearGroup();
    this.renderer?.dispose();
  }

  private initScene(): boolean {
    const host = this.canvasHost.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x18171b);

    const width = host.clientWidth || 1;
    const height = host.clientHeight || 1;

    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    this.camera.position.set(4.6, 3.1, 5.6);
    this.camera.lookAt(0, 0.6, 0);

    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      console.warn('WebGL is unavailable - skipping the 3D preview.');
      return false;
    }
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    host.appendChild(this.renderer.domElement);

    // Neutral studio environment so PBR materials have something soft to
    // reflect, instead of going flat/dead wherever they pick up specular.
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const studio = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(studio, 0.04).texture;
    pmremGenerator.dispose();
    studio.dispose();

    // Soft neutral fill so shadowed surfaces never go fully dead.
    const hemi = new THREE.HemisphereLight(0xfff6ea, 0x1c1a22, 0.85);

    // Broad key light, front-upper-left - stands in for a large softbox.
    const key = new THREE.DirectionalLight(0xfff8f0, 2.2);
    key.position.set(4.5, 6.5, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    key.shadow.radius = 4;
    key.shadow.bias = -0.0005;

    // Fill opposite the key, no shadow - lifts the dark side back up.
    const fill = new THREE.DirectionalLight(0xf3f6ff, 1.1);
    fill.position.set(-5, 4, 3);

    // Soft overhead top light so upward-facing surfaces don't go dark.
    const top = new THREE.DirectionalLight(0xffffff, 0.7);
    top.position.set(0, 8, 0);

    // Subtle warm rim from behind, separating the piece from the dark stage.
    const rim = new THREE.DirectionalLight(0xffe8c2, 1.0);
    rim.position.set(-3, 5, -6);

    // Faint colored glow tied to the product/category color - a soft wash
    // behind the piece rather than a tint on the piece itself, so identity
    // comes through without breaking the neutral sculptural material.
    this.accentLight = new THREE.PointLight(0x8b5a2b, 3.5, 9, 2);
    this.accentLight.position.set(0, 0.6, -1.7);

    this.scene.add(hemi, key, fill, top, rim, this.accentLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(4.2, 48),
      new THREE.MeshStandardMaterial({ color: 0x232025, roughness: 0.9, metalness: 0 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.scene.add(this.furnitureGroup);
    return true;
  }

  private observeResize(): void {
    const host = this.canvasHost.nativeElement;
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(host);
  }

  private handleResize(): void {
    if (!this.renderer || !this.camera) return;
    const host = this.canvasHost.nativeElement;
    const width = host.clientWidth || 1;
    const height = host.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);
    if (this.autoRotate()) {
      this.furnitureGroup.rotation.y += 0.0032;
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private clearGroup(): void {
    for (const child of [...this.furnitureGroup.children]) {
      this.furnitureGroup.remove(child);
      child.traverse((node) => {
        const mesh = node as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material?.dispose();
        }
      });
    }
  }

  private buildFurniture(category: string, colorHex: string): void {
    this.clearGroup();
    this.accentLight?.color.set(colorHex || '#8b5a2b');
    switch (category) {
      case 'Dining':
        this.buildDining();
        break;
      case 'Bed':
        this.buildBed();
        break;
      case 'Chair':
        this.buildChair(0, 0);
        break;
      case 'Wardrobe':
        this.buildWardrobe();
        break;
      case 'Sofa':
      default:
        this.buildSofa();
        break;
    }
  }

  private box(width: number, height: number, depth: number): THREE.BufferGeometry {
    return new RoundedBoxGeometry(width, height, depth, BEVEL_SEGMENTS, BEVEL_RADIUS);
  }

  private woodMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color: SCULPT_BASE, roughness: 0.85, metalness: 0 });
  }

  private lightMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color: SCULPT_LIGHT, roughness: 0.85, metalness: 0 });
  }

  private panelMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color: SCULPT_PANEL, roughness: 0.75, metalness: 0 });
  }

  private legMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color: SCULPT_LEG, roughness: 0.6, metalness: 0.05 });
  }

  private addMesh(geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.furnitureGroup.add(mesh);
    return mesh;
  }

  private buildSofa(): void {
    const body = this.woodMaterial();
    const legMat = this.legMaterial();

    this.addMesh(this.box(2.6, 0.5, 1.1), body, 0, 0.55, 0);
    this.addMesh(this.box(2.6, 0.75, 0.25), body, 0, 1.0, -0.44);
    this.addMesh(this.box(0.24, 0.65, 1.1), body, -1.32, 0.85, 0);
    this.addMesh(this.box(0.24, 0.65, 1.1), body, 1.32, 0.85, 0);

    const cushionMat = this.lightMaterial();
    [-0.85, 0, 0.85].forEach((x) => {
      this.addMesh(this.box(0.78, 0.24, 0.95), cushionMat, x, 0.92, 0.05);
    });

    [-1.15, 1.15].forEach((x) => {
      [-0.4, 0.4].forEach((z) => {
        this.addMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 12), legMat, x, 0.15, z);
      });
    });
  }

  private buildDiningChair(x: number, z: number, rotationY: number): void {
    const body = this.woodMaterial();
    const legMat = this.legMaterial();
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;

    const seat = new THREE.Mesh(this.box(0.5, 0.08, 0.5), body);
    seat.position.set(0, 0.5, 0);
    seat.castShadow = true;
    seat.receiveShadow = true;
    group.add(seat);

    const back = new THREE.Mesh(this.box(0.5, 0.55, 0.08), body);
    back.position.set(0, 0.8, -0.21);
    back.castShadow = true;
    group.add(back);

    [-0.2, 0.2].forEach((lx) => {
      [-0.2, 0.2].forEach((lz) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 10), legMat);
        leg.position.set(lx, 0.25, lz);
        leg.castShadow = true;
        group.add(leg);
      });
    });

    this.furnitureGroup.add(group);
  }

  private buildDining(): void {
    const body = this.woodMaterial();
    const legMat = this.legMaterial();

    this.addMesh(this.box(2.0, 0.1, 1.1), body, 0, 0.72, 0);
    [-0.85, 0.85].forEach((x) => {
      [-0.45, 0.45].forEach((z) => {
        this.addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.72, 10), legMat, x, 0.36, z);
      });
    });

    this.buildDiningChair(-1.15, 0, Math.PI / 2);
    this.buildDiningChair(1.15, 0, -Math.PI / 2);
    this.buildDiningChair(-0.4, 0.85, Math.PI);
    this.buildDiningChair(0.4, 0.85, Math.PI);
    this.buildDiningChair(-0.4, -0.85, 0);
    this.buildDiningChair(0.4, -0.85, 0);
  }

  private buildBed(): void {
    const body = this.woodMaterial();
    const legMat = this.legMaterial();
    const mattressMat = this.lightMaterial();
    const pillowMat = this.lightMaterial();

    this.addMesh(this.box(2.4, 0.28, 3.2), body, 0, 0.34, 0);
    this.addMesh(this.box(2.3, 0.28, 3.0), mattressMat, 0, 0.62, 0);
    this.addMesh(this.box(2.4, 1.0, 0.16), body, 0, 0.98, -1.52);

    [-0.75, 0.75].forEach((x) => {
      this.addMesh(this.box(0.55, 0.14, 0.38), pillowMat, x, 0.83, -1.15);
    });

    [-1.1, 1.1].forEach((x) => {
      [-1.45, 1.45].forEach((z) => {
        this.addMesh(this.box(0.14, 0.34, 0.14), legMat, x, 0.17, z);
      });
    });
  }

  private buildChair(x: number, z: number): void {
    const body = this.woodMaterial();
    const legMat = this.legMaterial();

    this.addMesh(this.box(0.9, 0.15, 0.9), body, x, 0.55, z);
    this.addMesh(this.box(0.9, 0.9, 0.12), body, x, 1.02, z - 0.4);
    this.addMesh(this.box(0.16, 0.6, 0.16), body, x - 0.4, 0.85, z - 0.36);
    this.addMesh(this.box(0.16, 0.6, 0.16), body, x + 0.4, 0.85, z - 0.36);

    [-0.36, 0.36].forEach((lx) => {
      [-0.36, 0.36].forEach((lz) => {
        this.addMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.55, 10), legMat, x + lx, 0.275, z + lz);
      });
    });
  }

  private buildWardrobe(): void {
    const body = this.woodMaterial();
    const doorMat = this.panelMaterial();
    const legMat = this.legMaterial();

    this.addMesh(this.box(1.9, 2.2, 0.75), body, 0, 1.14, 0);

    [-0.63, 0, 0.63].forEach((x) => {
      this.addMesh(this.box(0.58, 2.0, 0.06), doorMat, x, 1.14, 0.4);
    });

    [-0.63, 0, 0.63].forEach((x) => {
      this.addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), legMat, x + 0.22, 1.14, 0.44);
    });

    [-0.9, 0.9].forEach((x) => {
      [-0.32, 0.32].forEach((z) => {
        this.addMesh(this.box(0.12, 0.14, 0.12), legMat, x, 0.07, z);
      });
    });
  }
}
