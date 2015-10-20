## WebUI-Build Info


### What is the `webui-build` directory?
This directory is the built web-ui website.  If you do not wish to install `node` and do the build yourself, you can copy these files to your switch.

### Adding Web-UI to Switch
To add the web-ui to your switch, you first need to have a switch (physical or virtual) up and running.  Once you have that, do the following:
* On the switch, create the directory `/srv/www/static`
* Copy the contents of the `webui-build` directory to `/srv/www/static` on the switch (i.e. `scp webui-build/* root@your_switch:/srv/www/static`)

### Viewing Web-UI
After you have copied the files to your switch, bring up a browser (Chrome preferred) and browse to the IP address of your switch.
