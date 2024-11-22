//================================================ 
const { ccclass, property, menu, executeInEditMode } = cc._decorator;

@ccclass
export default class OffScreen extends cc.Component {
    @property([cc.Sprite]) spFrames: cc.Sprite[] = [];
    @property(cc.Sprite) spTarget: cc.Sprite = null;

    protected onLoad(): void {
        CC_PREVIEW && cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);
    }

    protected onDestroy(): void {
        CC_PREVIEW && cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);
    }

    //================================================ private
    private restart() {
        let rt = new cc.RenderTexture();
        rt.initWithSize(512, 512);

        this.blit(this.spFrames[0], rt, 0, 0);
        this.blit(this.spFrames[1], rt, 100, 0);
        cc.dynamicAtlasManager.getFrameBlit().update();

        let sf = new cc.SpriteFrame();
        sf.setTexture(rt);
        this.spTarget.spriteFrame = sf;
    }

    //================================================ events
    onEventKeyDown(event) {
        var keyCode = event.keyCode;

        switch(keyCode) {
            case 'R'.charCodeAt(0): {
                this.restart();
                break;
            }
        }
    }

    //================================================ utils
    private blit(sprite: cc.Sprite, rt: cc.RenderTexture, x: number, y: number) {
        let frameBlit = cc.dynamicAtlasManager.getFrameBlit();

        let spriteFrame = sprite.spriteFrame;
        let srcTexture = spriteFrame.getTexture();
        let dstTexture = rt;
        let frameW = spriteFrame._rect.width;
        let frameH = spriteFrame._rect.height;

        let tmpUV = [];
        spriteFrame.calculateFrameUV(tmpUV);

        frameBlit.blit(srcTexture, dstTexture, x, y, srcTexture.width, srcTexture.height, dstTexture.width, dstTexture.height, frameW, frameH, tmpUV, 1);
    }

    private showRenderTexture(rt: cc.RenderTexture, name = null) {
        // let camera = this.getComponent(cc.Camera);
        // camera.targetTexture = rt;
        // camera.render(this.nodeRoot);
        // camera.targetTexture = null;
        if (CC_PREVIEW) {
            let theName = name || Math.random().toFixed(7);
            let newWin = window.open("", theName);
            if (newWin == null || newWin.document == null) {
                return;
            }
            let pixels = new Uint8Array(4 * rt.width * rt.height);
            let framebuffer = rt["_framebuffer"];
            let texture = rt["_texture"];
            let gl = framebuffer._device._gl;
            let device = framebuffer._device;
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer._glID);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture._glID, 0);
            gl.viewport(0, 0, rt.width, rt.height);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
                gl.readPixels(0, 0, rt.width, rt.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            device._current.reset();
            device._gl.viewport(device._vx, device._vy, device._vw, device._vh);
            let img = new Image(rt.width, rt.height);
            if (rt.width > 1750 || rt.height > 1750) {
                if (rt.width > rt.height) {
                    img.width = 1750;
                    img.height = rt.height * (1750 / img.width);
                } else {
                    img.width = rt.width * (1750 / img.height);
                    img.height = 1750;
                }
            }
            newWin.document.body.innerHTML = "";
            newWin.document.body.appendChild(img);
            img.src = PNGStream.encodeRGBAtoPNG(pixels, rt.width, rt.height);
        } else {
            console.log("只能网页预览模式下使用本功能");
        }
    }
}
