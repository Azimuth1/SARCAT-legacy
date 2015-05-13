ssh user@host

cd /path/to/app/directory/
tar -vxzf gentlenode.com.tar.gz
mv bundle gentlenode.com
rm gentlenode.com.tar.gz

cd myapp.com/programs/server/
sudo rm -R node_modules/fibers/
sudo npm install fibers
cd ../../

# the database set at 1.2.4.
export MONGO_URL='mongodb://userApp:password@127.0.0.1:27017/appDB'
# port defined at 2.
export PORT=58080
export ROOT_URL='http://gentlenode.com/' # the url your website is available