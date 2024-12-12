let maxAtlasCount = 16;
let debug = CC_PREVIEW;
type AtlasConf = { textureSize: number, frameSize: number };

cc.dynamicAtlasManager.maxAtlasCountEx = maxAtlasCount;
cc.dynamicAtlasManager.textureSizeExFunc = (index) => {
    let conf = DynamicAtlasRoot.usedAtlasMap[index];
    return conf? conf.textureSize: 1024;
};
cc.dynamicAtlasManager.maxFrameSizeExFunc = (index) => {
    let conf = DynamicAtlasRoot.usedAtlasMap[index];
    return conf? conf.frameSize: 512;
};

//================================================ 
const {ccclass, property, menu} = cc._decorator;
@ccclass
@menu('动态合批/Root')
export default class DynamicAtlasRoot extends cc.Component {
    //================================================ static
    public static usedAtlasMap: {[key: number]: AtlasConf} = {};
    public static usedAtlasCnt: number = 0;
    /** 创建一个图集 -> 自动寻找可用的索引 */
    public static generate(textureSize: number, frameSize: number): number {
        let atlasIndex = -1;
        for(let i = 0; i < maxAtlasCount; i++) {
            if (!this.usedAtlasMap[i]) {
                atlasIndex = i;
                break;
            }
        }

        if (atlasIndex != -1) {
            this.usedAtlasMap[atlasIndex] = { textureSize: textureSize, frameSize: frameSize};
            this.usedAtlasCnt++;
            if (this.usedAtlasCnt > 8) {
                debug && console.error('[DynamicAtlas]', `too many atlas: ${this.usedAtlasCnt}`);
            }
        }
        debug && console.log('[DynamicAtlas]', `new atlas ${atlasIndex}`);
        return atlasIndex;
    }

    /** 移除指定图集 -> 从动态图集管理中卸载纹理 & 释放精灵缓存 */
    public static delete(atlasIndex: number): void {
        debug && console.log('[DynamicAtlas]', `del atlas ${atlasIndex}`);
        delete this.usedAtlasMap[atlasIndex];
        this.usedAtlasCnt--;
        cc.dynamicAtlasManager.deleteAtlas(atlasIndex);
        cc.Sprite.clearDynamicAtlas(atlasIndex);
    }

    //================================================ instance
    @property(cc.Integer) textureSize: number = 1024;
    @property(cc.Integer) frameSize: number = 512;
    @property(cc.Boolean) debug: boolean = false;

    private _atlasIndex: number     = 0;

    //================================================ cc.Component
    protected onDestroy(): void {
        if (this._atlasIndex == -1) {
            return;
        }
        
        DynamicAtlasRoot.delete(this._atlasIndex);
    }

    protected onLoad(): void {
        if (!this.debug) {
            return;
        }

        this._atlasIndex = DynamicAtlasRoot.generate(this.textureSize, this.frameSize);
        if (this._atlasIndex == -1) {
            console.warn('[DynamicAtlas]', `dynamic atlas count reach max count: ${maxAtlasCount}`);
            return;
        }

        this.getMaterial((material) => {
            if (cc.isValid(this.node)) {
                // @ts-ignore
                this.node.mp_sortedLayer_enabled = true;
                // @ts-ignore
                this.node.mp_sortedLayer_atlasIndex = this._atlasIndex;
                // @ts-ignore
                this.node.mp_sortedLayer_material = cc.Material.getInstantiatedMaterial(material, this);
            }
        })
    }

    //================================================ private
    private getMaterial(callback?: Function) {
        let key = 'Test/MultiTexture/material/DyAtlas';
        let material = cc.loader.getRes(key, cc.Material);
        if (!material) {
            cc.loader.loadRes(key, cc.Material, (err, res) => {
                if (!err) {
                    callback(res);
                }
            });
        } else {
            callback(material);
        }
    }
}

if (CC_PREVIEW) {
    window['DynamicAtlasRoot'] = DynamicAtlasRoot;
}
