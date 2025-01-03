//================================================ 
const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
export default class TextureCompress extends cc.Component {
    @property(cc.Sprite) spTest: cc.Sprite = null;
    @property(cc.Label) lbFormat: cc.Label = null;
    @property(cc.Label) lbExtAstc: cc.Label = null;
    @property(cc.Label) lbExtPvr: cc.Label = null;

    protected update(dt: number): void {
        if (this.spTest.spriteFrame) {
            this.lbFormat.string = this.spTest.spriteFrame.getTexture().getPixelFormat() + '';
        }

        this.lbExtAstc.string = `astc: ${cc.renderer.device.ext("WEBGL_compressed_texture_astc")? 1: 0}`;
        this.lbExtPvr.string = `pvr: ${cc.renderer.device.ext("WEBGL_compressed_texture_pvrtc")? 1: 0}`;
    }
}