//================================================ 
const { ccclass, property, menu, executeInEditMode } = cc._decorator;

@ccclass
export default class TestMultiTexture extends cc.Component {
    @property(cc.Node) nodeIns: cc.Node = null;
    @property(cc.Node) nodeContainer: cc.Node = null;

    protected onLoad(): void {
        for(let i = 0; i < 20; i++) {
            let node = cc.instantiate(this.nodeIns);
            node.parent = this.nodeContainer;
            node.position = cc.v2(Math.random() * 300 - 150, Math.random() * 300 - 150);
        }
    }
}
