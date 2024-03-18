# This programs generates a markdown document containing the contents of each of the provided files.
files = ["server.js", 
         "database/db-mgmt.js", 
         "database/init.js", 
         "framework/database-class.js", 
         "framework/server-class.js", 
         "public/account.js",
         "public/editor_container.js",
         "public/editor.js",
         "public/global.js"]

with open("impl.md", "w") as md:
    for file in files:
        with open(file, "r") as f:
            md.write(f"\n### {file}\n```\n")
            md.write(f.read())
            md.write("\n```\n")