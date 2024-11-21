
import os
import sys
import re
import json
from PIL import Image

path_src_image = sys.argv[1]
split_n = sys.argv[2]

#--------------------------------------------------
def split(image_file, n):
    # 创建输出目录
    output_dir, _ = os.path.splitext(image_file)
    filename, _ = os.path.splitext(os.path.basename(image_file))
    if not os.path.isdir(output_dir):
        if os.path.exists(os.path.dirname(output_dir)):
            os.mkdir(output_dir)
        else:
            os.makedirs(output_dir)

    # 拆分
    src_image = Image.open(image_file)
    w = src_image.width
    h = src_image.height
    cw = w / n
    ch = h / n
    index = 0
    for i in range(1, n + 1, 1):
        for j in range(1, n + 1, 1):
            x0 = (j - 1) * cw
            x1 = j * cw
            y0 = (i - 1) * ch
            y1 = i * ch

            temp_image = src_image.crop((x0, y0, x1, y1))
            output_filename = '{}_{}.png'.format(filename, index)
            output_path = os.path.join(output_dir, output_filename)
            temp_image.save(output_path)
            index = index + 1

split(path_src_image, int(split_n))