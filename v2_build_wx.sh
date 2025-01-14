CLIENT_PATH=$1
CDN_DIR=$2
TCCLI_PATH=$3

# 系统变量
if [ -z $CREATOR_PATH ]; then
	CREATOR_PATH="/Applications/CocosCreator.app/Contents/MacOS/CocosCreator"
fi
if [ -z $COCOS_ENGINE_CACHE ]; then
	COCOS_ENGINE_CACHE=$CLIENT_PATH/../cocos/engine/bin/.cache
fi

PROJECT_BUILD_PATH=$CLIENT_PATH/build/wechatgame

#-------------------------------------------------- function
# 构建前置处理
process_prev()
{
	# 1.重新编译引擎(额外增加20s构建时间)
	echo "[process_prev]" "# 1.重新编译引擎(额外增加20s构建时间)"
	rm -rf $COCOS_ENGINE_CACHE
}

# 构建
process_build()
{
	# 1.构建
	echo "[process_build]" "# 1.构建"
	rm -rf $PROJECT_BUILD_PATH
	"${CREATOR_PATH}" --path ${CLIENT_PATH} --build "platform=wechatgame;md5Cache=true;debug=false;buildPath=./build"
}

# 构建后置处理
process_post()
{
	# 1.纹理压缩
	echo "[process_post]" "# 1.纹理压缩"
	python3 ./v2_texture_compress.py astcenc convert $PROJECT_BUILD_PATH $CLIENT_PATH/build/build_cache_texture_compress

	# # 2.同步CDN
	echo "[process_post]" "# 2.同步CDN"
	sed -i '' 's/cdn_path/'$CDN_DIR'/g' $CLIENT_PATH/build/wechatgame/game.js
	python3 ./v2_upload_cdn.py bin/ossutilmac64 $CLIENT_PATH/build/wechatgame/res oss://merge-res-cn/wx/$CDN_DIR/res $CLIENT_PATH/build/build_cache_cdn https://kddql.beefungames.com/wx/$CDN_DIR/res $TCCLI_PATH
}

#-------------------------------------------------- main
shell_start_time=`date +%s`

process_prev
process_build
process_post

echo "----->v2_build_wx 耗时: " $[ `date +%s` - $shell_start_time ]
