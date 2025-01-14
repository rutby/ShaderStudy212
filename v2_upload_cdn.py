#coding=utf-8

import os
import sys
import re
import json
import subprocess
import stat

match_reg = re.compile(r'(\w+)\..*$')

osscli = sys.argv[1]
assets_path = sys.argv[2]
oss_path = sys.argv[3]
cache_path = sys.argv[4]
cdn_path = sys.argv[5]
tccli = sys.argv[6]

json_path = os.path.join(cache_path, 'upload.json') 
profile_path = '~/.ossutilconfigmergecn'

print('oss_path:', oss_path)
print('cdn_path:', cdn_path)

#-------------------------------------------------- utils
def run_cmd(cmd_list):
    print('run cmd: {}'.format(' '.join(cmd_list)))
    subprocess.call(cmd_list)

#-------------------------------------------------- main
def walkDir(dir_path):
    if not os.path.exists(cache_path):
        os.mkdir(cache_path)

    if not os.path.exists(json_path):
        with open(json_path, 'w+') as f:
            f.write('{}')
        
    map_uploaded = {}
    with open(json_path, 'r+') as f:
        map_uploaded = json.load(f)

    upload_cnt = 0
    purge_urls = ''
    for root, dirs, files in os.walk(dir_path):
        for name in files:
            match_reg_result = match_reg.search(name)
            if match_reg_result:
                input_path = os.path.join(root, name)
                relative_path = root[len(assets_path):] + '/' + name
                output_path = oss_path + relative_path
                cdn_url = cdn_path + relative_path

                map_url = map_uploaded.get(relative_path)
                if not map_url:
                    map_url = {}
                
                not_cached = not map_url.get(output_path)

                # 总是上传不压缩的图片
                if not_cached:
                    map_url[output_path] = True
                    run_cmd([osscli, 'cp', '-u', input_path, output_path, '-c', profile_path])
                    upload_cnt = upload_cnt + 1

                # 刷新腾讯云
                # if always_upload:
                    # purge_urls = purge_urls + cdn_url

                map_uploaded[relative_path] = map_url
    print('upload_cnt:', upload_cnt)

    if len(purge_urls) > 0:
        run_cmd([tccli, 'cdn', 'PurgeUrlsCache', '--cli-unfold-argument', '--Urls', purge_urls])

    with open(json_path, 'w') as f:
        json.dump(map_uploaded, f)

walkDir(assets_path)