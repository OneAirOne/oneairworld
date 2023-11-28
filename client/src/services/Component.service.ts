import Phaser from "phaser";
import short from "short-uuid";

export type Constructor<T extends {} = {}> = new (...args: any[]) => T;

export interface IComponent {
  init(go: Phaser.GameObjects.GameObject): any;

  awake?: () => void;
  start?: () => void;
  update?: (dt: number) => void;

  destroy?: () => void;
}

/**
 * Following component pattern, this service enable to share logic
 * and follow life cicle component
 *
 * Credits : https://www.youtube.com/watch?v=qzsbGLghrMM
 */
export default class ComponentService {
  private _componentsByGameObject = new Map<string, IComponent[]>();
  private _queuedForStart: IComponent[] = [];

  addComponent(go: Phaser.GameObjects.GameObject, component: IComponent) {
    // Give our gameObject a unique name
    if (!go.name) {
      go.name = short.generate();
    }

    // Make sure there is a list of components for the gameObject
    if (!this._componentsByGameObject.has(go.name)) {
      this._componentsByGameObject.set(go.name, []);
    }

    // Add new component to this gameobject's list
    const list = this._componentsByGameObject.get(go.name) as IComponent[];
    list.push(component);

    component.init(go);

    if (component.awake) {
      component.awake();
    }

    if (component.start) {
      this._queuedForStart.push(component);
    }
  }

  findComponent(
    go: Phaser.GameObjects.GameObject,
    componentType: Constructor<any>
  ) {
    const components = this._componentsByGameObject.get(go.name);
    if (!components) return null;

    return components.find((component) => components instanceof componentType);
  }

  destroy() {
    const entries = this._componentsByGameObject.entries();
    for (const [, components] of entries) {
      components.forEach((component) => {
        if (component.destroy) {
          component.destroy();
        }
      });
    }
  }

  update(dt: number) {
    while (this._queuedForStart.length > 0) {
      const component = this._queuedForStart.shift();
      if (component?.start) {
        component.start();
      }
    }

    // Update each component on each gameobject
    const entries = this._componentsByGameObject.entries();
    for (const [, components] of entries) {
      components.forEach((component) => {
        if (component.update) {
          component.update(dt);
        }
      });
    }
  }
}
