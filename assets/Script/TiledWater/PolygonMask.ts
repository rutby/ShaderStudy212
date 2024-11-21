//================================================ 
const { ccclass, property, menu, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class PolygonMask extends cc.Component {
    @property(cc.PolygonCollider) collider: cc.PolygonCollider = null;

    protected onLoad(): void {
        this.reload();
    }

    protected update(dt: number): void {
        if (CC_EDITOR) {
            this.reload();
        }
    }

    //================================================ private
    private reload() {
        let mask = this.getComponent(cc.Mask);
        if (!mask || !this.collider) {
            return;
        }

        mask['GraphicsUpdateSkip'] = true;
        let graphics: cc.Graphics = mask['_graphics'];

        let width = this.node.width;
        let height = this.node.height;
        let x = -width * this.node.anchorX;
        let y = -height * this.node.anchorY;

        graphics.clear(false);

        this.collider.points.forEach((ele, index) => {
            if (index == 0) {
                graphics.moveTo(ele.x, ele.y);
            } else {
                graphics.lineTo(ele.x, ele.y);
            }
        });
        if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
            graphics.stroke();
        } else {
            graphics.fill();
        }
    }
}
