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

        // graphics.rect(x, y, width, height);
        // if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
        //     graphics.stroke();
        // } else {
        //     graphics.fill();
        // }
    }
}

/**
 * 
precision highp float;
vec4 CCFragOutput (vec4 color) {
 return color;
}
varying vec2 v_uv;
  uniform vec4 color;
#define pi 3.1415
float sdRoundBox( vec2 p, vec2 b, float r )
{
 vec2 q = abs(p) - b + r;
 return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r;
}
vec4 frag() {
 float d = sdRoundBox((v_uv - 0.5), vec2(0.5, 0.5), 0.3);
 vec3 col = vec3(1.0) - sign(d)*vec3(1., 1., 1.);
 col *= 1. - exp(-2.0*abs(d));
 return CCFragOutput(vec4(col, 1.));
}
void main() { gl_FragColor = frag(); }
 */
