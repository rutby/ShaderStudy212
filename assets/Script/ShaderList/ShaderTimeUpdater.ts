//================================================ 
const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class ShaderTimeUpdater extends cc.Component {
    private _material: cc.Material = null;
    private _time: number = 0;

    protected onLoad(): void {
        this._material = this.node.getComponent(cc.RenderComponent).getMaterial(0);
    }

    protected update(dt: number): void {
        if (CC_EDITOR) {
            this._material = this.node.getComponent(cc.RenderComponent).getMaterial(0);
        }
        
        this._time += dt;
        this._material.setProperty('c_time', this._time);
    }
}
