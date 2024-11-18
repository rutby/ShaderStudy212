//================================================ 
const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
export default class App extends cc.Component {
    protected onLoad(): void {
        cc.dynamicAtlasManager.enabled = false;
    }
}
