from distutils.core import setup
# It might be more future-proof to use distribute instead of distutils,
# but the former has a very stupid quirk whereby package_data is not put
# in the sdist.


from distutils.core import setup
import py2exe
import os

setup_args = {
      'name': 'Annotald'
    , 'version': '0.0.1'
    , 'author': 'Aaron Ecay, Anton Karl Ingason and Jana Beck'
    , 'author_email': 'aaronecay@gmail.com'
    , 'url': 'foo'
    , 'description': 'A GUI for treebank annotation'
    , 'license': "LICENSE"
    # TODO: long_description
}

if os.name == "nt":
    import shutil
    import glob

    manifest = """
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<assembly xmlns="urn:schemas-microsoft-com:asm.v1"
manifestVersion="1.0">
<assemblyIdentity
    version="0.64.1.0"
    processorArchitecture="x86"
    name="Controls"
    type="win32"
/>
<description>Annotald/description>
<dependency>
    <dependentAssembly>
        <assemblyIdentity
            type="win32"
            name="Microsoft.Windows.Common-Controls"
            version="6.0.0.0"
            processorArchitecture="X86"
            publicKeyToken="6595b64144ccf1df"
            language="*"
        />
    </dependentAssembly>
</dependency>
</assembly>
"""
    
    annotald_data_files = []

    annotald_data_files.append( ('', ['settings.js','CS_Tony_oct19.jar',
                                      'nothing.q','user-plain-red.png',
                                      'user-plain-blue.png']) )

    html_files =  glob.glob('data/html/*.mako')
    annotald_data_files.append( ('data/html', html_files) )

    image_files =  glob.glob('data/images/*.png')
    annotald_data_files.append( ('data/images', image_files) )

    script_files =  glob.glob('data/scripts/*.js')
    annotald_data_files.append( ('data/scripts', script_files) )

    css_files =  glob.glob('data/css/*.css')
    annotald_data_files.append( ('data/css', css_files) )

    setup(windows=[{ "script": "annotald-win.py",
                     "other resources": [24,1, manifest]
                 }],
          data_files = annotald_data_files,
          options={ "py2exe":{ "skip_archive": True } },
          **setup_args)  

else:
    setup(
          packages = ['annotald']
        , scripts = ['bin/annotald', 'bin/cs-to-annotald.py']
        # TODO: or data_files?; move corpussearch jar somewhere; ...
        , package_data = { 'annotald': ["data/*/*", "settings.py",
                                        "settings.js",
                                        "CS_Tony_oct19.jar"] }
        , install_requires = ["nltk",
                              "numpy", # NLTK lyingly claims not to
                                       # require numpy
                              "mako", "cherrypy", "setuptools"]
        , provides = ["annotald"]
        , **setup_args
    )