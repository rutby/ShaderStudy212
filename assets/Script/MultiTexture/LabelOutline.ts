//================================================ 
const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class LabelOutline extends cc.Component {
    @property(cc.Color) color = new cc.Color(0,0,0,255);

    protected onLoad(): void {
        this.applyColor();
        this.applyDyAtlas();
    }

    protected update(dt: number): void {
        if (!CC_EDITOR) {
            return;
        }

        this.applyColor();
    }

    //================================================ private
    private _colorVal: number = null;
    private applyColor() {
        let material = this.getComponent(cc.RenderComponent).getMaterial(0);
        if (material) {
            if (this._colorVal != this.color._val) {
                this._colorVal = this.color._val;
                material.setProperty('RGBA', this.color);
            }
        }
    }

    private applyDyAtlas() {
        this.node._dyAtlas_color = this.color;
    }
}