//================================================ 
const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
export default class App extends cc.Component {
    protected onLoad(): void {
        // cc.debug.setDisplayStats(false);

        CC_PREVIEW && cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);
    }

    protected onDestroy(): void {
        CC_PREVIEW && cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);
    }

    //================================================ events
    onEventKeyDown(event) {
        var keyCode = event.keyCode;

        switch(keyCode) {
            case '0'.charCodeAt(0): {
                window['showAtlasTexture'](true);
                break;
            }
        }
    }
}

if (CC_PREVIEW) {
    window['showRenderTexture'] = (rt: cc.RenderTexture, name = null) => {
        if (CC_DEBUG && CC_PREVIEW && !CC_JSB && rt) {
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