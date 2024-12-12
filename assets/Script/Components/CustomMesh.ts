//================================================ 
const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@(executeInEditMode)
export default class CustomMesh extends cc.Component {
    protected onLoad(): void {
        let spMesh = this.getComponent(cc.Sprite);
        if (spMesh) {
            let tw = spMesh.spriteFrame.getTexture().width;
            let th = spMesh.spriteFrame.getTexture().height;

            spMesh.spriteFrame.vertices = {
                x: [0, 0, tw, tw], // 左上 左下 右上 右下
                y: [0, th, 0, th],
                nu: [0, 0, 1, 1],
                nv: [0, 1, 0, 1],
                triangles: [0, 1, 2, 2, 1, 3],
            };
            spMesh.markForUpdateRenderData(true);
        }
    }
}
