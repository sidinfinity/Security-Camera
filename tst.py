#!/usr/bin/python3

import re



def get_filename(fname: str) -> str:
    regex = re.compile(r'(.*)\.jpg')
    match = re.match(regex, fname)
    if match:
        return match.group(1)
    return None

fname = "0--Parade/0_Parade_marchingband_1_849.jpg"
print(get_filename(fname))
