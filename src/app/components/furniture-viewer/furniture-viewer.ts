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
    this.scene.fog = new THREE.Fog(0x18171b, 8, 16);

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
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    host.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0x4a4238, 1.6);
    const key = new THREE.SpotLight(0xfff1d6, 4.2, 24, Math.PI / 3.4, 0.5, 1);
    key.position.set(4, 6.5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    const rim = new THREE.DirectionalLight(0xe8c07d, 0.9);
    rim.position.set(-5, 3, -4);
    const fill = new THREE.DirectionalLight(0x8896b3, 0.55);
    fill.position.set(-3, 2, 4);
    const front = new THREE.DirectionalLight(0xfff6e8, 0.5);
    front.position.set(0, 3, 6);
    this.scene.add(ambient, key, rim, fill, front);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(4.2, 48),
      new THREE.MeshStandardMaterial({ color: 0x232025, roughness: 0.9, metalness: 0.1 }),
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
    const color = new THREE.Color(colorHex || '#8b5a2b');
    switch (category) {
      case 'Dining':
        this.buildDining(color);
        break;
      case 'Bed':
        this.buildBed(color);
        break;
      case 'Chair':
        this.buildChair(color, 0, 0);
        break;
      case 'Wardrobe':
        this.buildWardrobe(color);
        break;
      case 'Sofa':
      default:
        this.buildSofa(color);
        break;
    }
  }

  private woodMaterial(color: THREE.Color): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.12 });
  }

  private legMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color: 0x0e0c0a, roughness: 0.4, metalness: 0.2 });
  }

  private addMesh(geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.furnitureGroup.add(mesh);
    return mesh;
  }

  private buildSofa(color: THREE.Color): void {
    const body = this.woodMaterial(color);
    const legMat = this.legMaterial();

    this.addMesh(new THREE.BoxGeometry(2.6, 0.5, 1.1), body, 0, 0.55, 0);
    this.addMesh(new THREE.BoxGeometry(2.6, 0.75, 0.25), body, 0, 1.0, -0.44);
    this.addMesh(new THREE.BoxGeometry(0.24, 0.65, 1.1), body, -1.32, 0.85, 0);
    this.addMesh(new THREE.BoxGeometry(0.24, 0.65, 1.1), body, 1.32, 0.85, 0);

    const cushionMat = this.woodMaterial(color.clone().lerp(new THREE.Color(0xffffff), 0.12));
    [-0.85, 0, 0.85].forEach((x) => {
      this.addMesh(new THREE.BoxGeometry(0.78, 0.24, 0.95), cushionMat, x, 0.92, 0.05);
    });

    [-1.15, 1.15].forEach((x) => {
      [-0.4, 0.4].forEach((z) => {
        this.addMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 12), legMat, x, 0.15, z);
      });
    });
  }

  private buildDiningChair(color: THREE.Color, x: number, z: number, rotationY: number): void {
    const body = this.woodMaterial(color);
    const legMat = this.legMaterial();
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), body);
    seat.position.set(0, 0.5, 0);
    seat.castShadow = true;
    seat.receiveShadow = true;
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.08), body);
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

  private buildDining(color: THREE.Color): void {
    const body = this.woodMaterial(color);
    const legMat = this.legMaterial();

    this.addMesh(new THREE.BoxGeometry(2.0, 0.1, 1.1), body, 0, 0.72, 0);
    [-0.85, 0.85].forEach((x) => {
      [-0.45, 0.45].forEach((z) => {
        this.addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.72, 10), legMat, x, 0.36, z);
      });
    });

    this.buildDiningChair(color, -1.15, 0, Math.PI / 2);
    this.buildDiningChair(color, 1.15, 0, -Math.PI / 2);
    this.buildDiningChair(color, -0.4, 0.85, Math.PI);
    this.buildDiningChair(color, 0.4, 0.85, Math.PI);
    this.buildDiningChair(color, -0.4, -0.85, 0);
    this.buildDiningChair(color, 0.4, -0.85, 0);
  }

  private buildBed(color: THREE.Color): void {
    const body = this.woodMaterial(color);
    const legMat = this.legMaterial();
    const mattressMat = this.woodMaterial(new THREE.Color(0xefe8d8));
    const pillowMat = this.woodMaterial(new THREE.Color(0xfaf6ec));

    this.addMesh(new THREE.BoxGeometry(2.4, 0.28, 3.2), body, 0, 0.34, 0);
    this.addMesh(new THREE.BoxGeometry(2.3, 0.28, 3.0), mattressMat, 0, 0.62, 0);
    this.addMesh(new THREE.BoxGeometry(2.4, 1.0, 0.16), body, 0, 0.98, -1.52);

    [-0.75, 0.75].forEach((x) => {
      this.addMesh(new THREE.BoxGeometry(0.55, 0.14, 0.38), pillowMat, x, 0.83, -1.15);
    });

    [-1.1, 1.1].forEach((x) => {
      [-1.45, 1.45].forEach((z) => {
        this.addMesh(new THREE.BoxGeometry(0.14, 0.34, 0.14), legMat, x, 0.17, z);
      });
    });
  }

  private buildChair(color: THREE.Color, x: number, z: number): void {
    const body = this.woodMaterial(color);
    const legMat = this.legMaterial();

    this.addMesh(new THREE.BoxGeometry(0.9, 0.15, 0.9), body, x, 0.55, z);
    this.addMesh(new THREE.BoxGeometry(0.9, 0.9, 0.12), body, x, 1.02, z - 0.4);
    this.addMesh(new THREE.BoxGeometry(0.16, 0.6, 0.16), body, x - 0.4, 0.85, z - 0.36);
    this.addMesh(new THREE.BoxGeometry(0.16, 0.6, 0.16), body, x + 0.4, 0.85, z - 0.36);

    [-0.36, 0.36].forEach((lx) => {
      [-0.36, 0.36].forEach((lz) => {
        this.addMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.55, 10), legMat, x + lx, 0.275, z + lz);
      });
    });
  }

  private buildWardrobe(color: THREE.Color): void {
    const body = this.woodMaterial(color);
    const doorMat = this.woodMaterial(color.clone().lerp(new THREE.Color(0x000000), 0.12));
    const legMat = this.legMaterial();

    this.addMesh(new THREE.BoxGeometry(1.9, 2.2, 0.75), body, 0, 1.14, 0);

    [-0.63, 0, 0.63].forEach((x) => {
      this.addMesh(new THREE.BoxGeometry(0.58, 2.0, 0.06), doorMat, x, 1.14, 0.4);
    });

    [-0.63, 0, 0.63].forEach((x) => {
      this.addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), legMat, x + 0.22, 1.14, 0.44);
    });

    [-0.9, 0.9].forEach((x) => {
      [-0.32, 0.32].forEach((z) => {
        this.addMesh(new THREE.BoxGeometry(0.12, 0.14, 0.12), legMat, x, 0.07, z);
      });
    });
  }
}
