//================================================ 
const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
export default class SceneDynamicAtlas extends cc.Component {
    @property(cc.Node) nodeContainer0: cc.Node = null;
    @property(cc.Node) nodeContainer1: cc.Node = null;
    
    protected onLoad(): void {
        cc.debug.setDisplayStats(false);

        CC_PREVIEW && cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);

        cc.loader.loadRes('DynamicAtlas/Prefab/Test0', cc.Prefab, (err, res) => {
            if (!err) {
                let node = cc.instantiate(res);
                node.parent = this.nodeContainer0;
            }
        })
    }

    protected onDestroy(): void {
        CC_PREVIEW && cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);
    }

    //================================================ events
    onEventKeyDown(event) {
        var keyCode = event.keyCode;

        switch(keyCode) {
            case '0'.charCodeAt(0): {
                this.test0();
                break;
            }
        }
    }

    //================================================ private
    private test0() {
        let node = cc.instantiate(this.nodeContainer0);
        node.parent = this.nodeContainer1;

        this.nodeContainer0.safetyDestroyAllChildren();
    }
}