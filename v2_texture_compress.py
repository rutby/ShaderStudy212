#coding=utf-8

import os
import sys
import re
import json
import subprocess
import time

# ['.astc', '.pkm', '.pvr', '.webp', '.jpg', '.jpeg', '.bmp', '.png']
match_png = re.compile(r'(\w+)\.(png|jpg|jepg)$')
match_png_unsupport = re.compile(r'(\w+)\.(webp|bmp)$')
match_texture_list = re.compile(r'\:\s*\[([^\]]*)\]')

bin_astcenc = sys.argv[1]
bin_convert = sys.argv[2]
path_assets = sys.argv[3]
path_cache  = sys.argv[4]

#-------------------------------------------------- utils
def run_cmd(cmd_list, enable_log=False):
    enable_log and print('run cmd: {}'.format(' '.join(cmd_list)))
    subprocess.call(cmd_list)
    
def get_custom_compress_fmt_conf():
    json_cfmt = {}
    with open('./v2_texture_compress.json', 'r+') as f:
        json_cfmt = json.load(f)

    json_uuid = {}
    with open('./spriteFrameMap.json', 'r+') as f:
        json_uuid = json.load(f)
    
    conf = {}
    order = ['dir', 'file']
    for order_key in order:
        for url_cfmt, cfmt in json_cfmt.get(order_key).items():
            for url_uuid, build_paths in json_uuid.items():
                if url_cfmt in url_uuid:
                    for build_path in build_paths:
                        l = build_path.rindex('/') + 1
                        r = build_path.rindex('.')
                        uuid = build_path[l:r]
                        conf[uuid] = (cfmt, url_uuid.replace('assets/', ''))
    return conf

astc_format_map = {
    '30': '4x4',
    '31': '5x4',
    '32': '5x5',
    '33': '6x5',
    '34': '6x6',
    '35': '8x5',
    '36': '8x6',
    '37': '8x8',
    '38': '10x5',
    '39': '10x6',
    '40': '10x8',
    '41': '10x10',
    '42': '12x10',
    '43': '12x12',
}

def find_settings_file(path_assets):
    path_settings_dir = os.path.join(path_assets, 'src')
    for root, dirs, files in os.walk(path_settings_dir):
        for filename in files:
            if 'settings' in filename and root == path_settings_dir:
                return os.path.join(root, filename)

def check_compress_fmt(fmt):
    success = True

    fmts = fmt
    if '_' in fmt:
        fmts = fmt.split('_')

    for item in fmts:
        if len(item) == 1:
            success = item == '0'
        else:
            fmt_compress, fmt_texture = item.split('@')
            if fmt_compress == '7':
                success = astc_format_map.get(fmt_texture)
            elif fmt_compress == '5':
                success = '8'
            else:
                success = False

        if not success:
            break
    return success

def replace_compress_fmt(lines_modified, texture_index, texture_fmt):
    line = lines_modified[texture_index]
    segments = line.split(',')
    segments[0] = texture_fmt
    lines_modified[texture_index] = ','.join(segments)

extnames = ['.png', '.jpg', '.jpeg', '.bmp', '.webp', '.pvr', '.pkm', '.astc']
def fix_compress_fmt(texture_fmt, ext):
    fmts = texture_fmt
    if '_' in fmts:
        fmts = texture_fmt.split('_')

    fmts_fixed = []
    for fmt in fmts:
        fmt_fixed = fmt
        if fmt == '0':
            fmt_fixed = str(extnames.index(ext))
        fmts_fixed.append(fmt_fixed)
    
    return '_'.join(fmts_fixed)

#-------------------------------------------------- main
def walkDir(path_assets):
    if not os.path.exists(path_cache):
        os.mkdir(path_cache)
    
    compress_format_default = "7@30_0"
    
    #-------------------------------------------------- 查找json文件
    with open("tmp.txt", "w") as f:
        subprocess.call(['grep', '-rl', 'cc.Texture2D', os.path.join(path_assets, 'res', 'import')], stdout=f)
    
    path_json = None
    with open('tmp.txt', 'r+') as f:
        path_json = f.read().strip()
    os.remove('tmp.txt')
    print(f'[v2_texture_compress] path_json: {path_json}')

    #-------------------------------------------------- 解析json文件
    data_format = None
    data_json = None
    with open(path_json, 'r+') as f:
        data_json = json.load(f)
        data_format = data_json.get('data')

    lines_modified = data_format.split('|')

    #-------------------------------------------------- 解析settings文件
    name_json = path_json[path_json.rindex('/')+1:]
    hash_json = name_json[:name_json.index('.')]
    
    path_settings = find_settings_file(path_assets)
    
    run_cmd(['sed', '-i', '', 's/window\._CCSettings/global\._CCSettings/g', path_settings])
    run_cmd(['node', 'v2_texture_compress.js', path_settings])
    run_cmd(['sed', '-i', '', 's/global\._CCSettings/window\._CCSettings/g', path_settings])

    content_settings = None
    with open('tmp_settings.json', 'r+') as f:
        content_settings = json.load(f)
    os.remove('tmp_settings.json')

    texture_list = content_settings.get('packedAssets').get(hash_json)
    assets_map = content_settings.get('rawAssets').get('assets')
    raw_assets_list = content_settings.get('md5AssetsMap').get('raw-assets')
    uuid_list = content_settings.get('uuids')
    assets_map_reverse = {}
    for key, value in assets_map.items():
        assets_map_reverse[value[0]] = key

    #-------------------------------------------------- 解析spriteFrame.json
    uuid_to_mtime = {}
    with open('./library/uuid-to-mtime.json', 'r+') as f:
        uuid_to_mtime = json.load(f)

    #-------------------------------------------------- 自定义格式替换
    # custom_compress_fmt_conf = get_custom_compress_fmt_conf()
    custom_compress_fmt_conf = {}
    texture_cnt = 0
    texture_fmts = {}
    for root, dirs, files in os.walk(os.path.join(path_assets, 'res', 'raw-assets')):
        for filename in files:
            match_png_unsupport_result = match_png_unsupport.search(filename)
            if match_png_unsupport_result:
                print(f'[v2_texture_compress] unsupport image suffix {filename}')
                exit(1)

            match_png_result = match_png.search(filename)
            if match_png_result:
                name, ext = os.path.splitext(filename)
                index_dot = name.rindex('.')
                name_without_md5 = name[:index_dot]
                md5 = name[index_dot+1:]

                # 1. 获取自定义图片格式
                texture_fmt = compress_format_default
                fmt_conf = custom_compress_fmt_conf.get(name_without_md5)
                if fmt_conf:
                    texture_fmt = fmt_conf[0]

                # 2. 跳过引擎内置图片
                uuid_to_mtime_value = uuid_to_mtime.get(name_without_md5)
                if uuid_to_mtime_value:
                    relative_path = uuid_to_mtime_value.get('relativePath')
                    if not 'resources' in relative_path:
                        texture_fmt = '0'
                        print(f'[v2_texture_compress] builtin image: {name_without_md5}, {texture_fmt}')
                else:
                    # print(f'[v2_texture_compress] not found in uuid_to_mtime: {name_without_md5}, {texture_fmt}')
                    pass
                
                # 3. 设置自定义图片格式
                texture_fmts[name_without_md5] = texture_fmt
                raw_assets_index = raw_assets_list.index(md5)
                if not raw_assets_index:
                    print(f'[v2_texture_compress] md5 {md5} not found in settings')
                    exit(1)

                uuid = raw_assets_list[raw_assets_index-1]
                uuid_index = uuid_list.index(uuid)
                texture_index = texture_list.index(uuid_index)
                line = lines_modified[texture_index]

                texture_fmt_fixed = fix_compress_fmt(texture_fmt, ext)
                if texture_fmt_fixed != texture_fmt:
                    print(f'[v2_texture_compress] fix_compress_fmt: {texture_fmt} -> {texture_fmt_fixed}')
                replace_compress_fmt(lines_modified, texture_index, texture_fmt_fixed)
                texture_cnt = texture_cnt + 1
                # print(f'[v2_texture_compress] {md5}, {raw_assets_index}, {uuid}, {uuid_index}, {texture_index}, {line}')
                
    print(f'[v2_texture_compress] texture_cnt: {texture_cnt}, {len(lines_modified)}')

    with open(path_json, 'w+') as f:
        data_json['data'] = '|'.join(lines_modified)
        json.dump(data_json, f)

    #-------------------------------------------------- 生成压缩文件
    for root, dirs, files in os.walk(os.path.join(path_assets, 'res')):
        for filename in files:
            match_png_result = match_png.search(filename)
            if match_png_result:
                name, ext = os.path.splitext(filename)
                name_without_md5 = name[:name.rindex('.')]
                path_input = os.path.join(root, filename)
                path_input_astc = os.path.join(root, f"{name}.astc")
                path_output_astc = os.path.join(path_cache, f"{name}.astc")
                path_output_flip = os.path.join(path_cache, f"{name}-flip{ext}")
                path_output_raw = os.path.join(path_cache, f"{name}-raw{ext}")

                compress_formats_custom = texture_fmts.get(name_without_md5)
                compress_formats_fixed = (compress_formats_custom)
                
                if '_' in compress_formats_custom:
                    compress_formats_fixed = compress_formats_custom.split('_')

                for compress_format_fixed in compress_formats_fixed:
                    if len(compress_format_fixed) == 1:
                        pass
                    else:
                        fmt_compress, fmt_texture = compress_format_fixed.split('@')
                        if fmt_compress == '7':
                            fmt_args = astc_format_map.get(fmt_texture)
                            if not fmt_args:
                                print(f'unsupport texture format {fmt_texture}')
                                exit(1)

                            if not os.path.exists(path_output_flip):
                                run_cmd([bin_convert, '-flip', path_input, path_output_flip], True)

                            if not os.path.exists(path_output_astc):
                                run_cmd([bin_astcenc, '-cl', path_output_flip, path_output_astc, fmt_args, '-medium'], True)

                            # if not os.path.exists(path_output_raw):
                            #     run_cmd(['cp', path_input, path_output_raw], True)
                            
                            # if not os.path.exists(path_output_astc):
                            #     run_cmd([bin_astcenc, '-cl', path_output_raw, path_output_astc, fmt_args, '-medium'], True)

                            run_cmd(['cp', path_output_astc, path_input_astc])
                        elif fmt_compress == '5':
                            # @todo(chentao) etc2
                            pass

start_time = time.time()
walkDir(path_assets)
end_time = time.time()
elapsed_time = end_time - start_time
print(f"[v2_texture_compress]: script run time: {elapsed_time:.2f} s")