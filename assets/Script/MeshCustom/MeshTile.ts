//================================================ 
const { ccclass, property, menu, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class MeshTile extends cc.Component {
    @property(cc.Float) x0: number = 0;
    @property(cc.Float) x1: number = 0;
    @property(cc.Float) y0: number = 0;
    @property(cc.Float) y1: number = 0;

    protected onLoad(): void {
        this.updateVerts();
    }

    protected update(dt: number): void {
        if (CC_EDITOR) {
            this.updateVerts();
        }
    }

    //================================================ private
    private updateVerts() {
        let spMesh = this.getComponent(cc.Sprite);
        let w = this.node.width;
        let h = this.node.height;
        // 左上 左下 右上 右下
        spMesh.spriteFrame.vertices = {
            x: [this.x0 * w, this.x0 * w, this.x1 * w, this.x1 * w],
            y: [this.y0 * h, this.y1 * h, this.y0 * h,  this.y1 * h],
            nu: [this.x0, this.x0, this.x1, this.x1],
            nv: [this.y0, this.y1, this.y0, this.y1],
            triangles: [0, 1, 2, 2, 1, 3],
        };
        spMesh.markForUpdateRenderData(true);
    }
}
