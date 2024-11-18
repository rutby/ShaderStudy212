//================================================ 
const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class SpineRuntime extends cc.Component {
    @property(sp.Skeleton) spineCat: sp.Skeleton = null;

    protected onLoad(): void {
        CC_PREVIEW && cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);
    }

    protected onDestroy(): void {
        CC_PREVIEW && cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);
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

    //================================================ private
    private restart() {
        // this.spineCat.setAnimation(0, 'cat_level3_act2', false);
        // this.spineCat.addAnimation(0, 'cat_level3_idle2', true);

        this.spineCat.setAnimation(0, 'act1', false);
        // this.spineCat.addAnimation(0, 'idle1', true);
    }
}
