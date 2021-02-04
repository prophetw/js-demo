import hashlib
import time  # 引入time模块
def md5(fname):
    hash_md5 = hashlib.md5()
    with open(fname, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()
startTime = time.time()
result = md5('./Docker Desktop Installer.exe')
endTime = time.time()
print('cost: ',endTime-startTime, result)
