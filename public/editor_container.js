class EditorContainer {
    editor;
    page = 0;
    pageContent = [];
    constructor(documentID, pages, defaultPage){
        this.editor = CodeMirror(document.getElementById(documentID), {
            mode:  "clike",
            lineNumbers: "true",
            matchBrackets: "true"
        }); // Codemirror 5 used for editor
        this.pageContent = pages;
        this.page = defaultPage;
        this.loadPage();
    }

    switchPage(newPageID){
        this.syncPages();
        this.page = newPageID;
        this.loadPage();
    }
    
    syncPages(){
        this.pageContent[this.page] = this.editor.getValue();
    }

    loadPage(){
        this.editor.setValue(this.pageContent[this.page]);
    }
}