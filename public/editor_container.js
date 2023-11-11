class EditorContainer {
    editor; // Reference to the editor object
    page = 0; // Current page number
    pageContent = []; // An array of each page's content
    constructor(documentID, pages, defaultPage){ // Constructor method
        this.editor = CodeMirror(document.getElementById(documentID), {
            mode:  "clike",
            lineNumbers: "true",
            matchBrackets: "true"
        }); // Codemirror 5 used for editor
        this.pageContent = pages;
        this.page = defaultPage;
        this.#loadPage();
    }

    switchPage(newPageID){ // Public method that swaps the currently displayed page
        this.syncPages();
        this.page = newPageID;
        this.#loadPage();
    }
    
    syncPages(){ // Public method to sync the currently displayed content with the stored content for that page
        this.pageContent[this.page] = this.editor.getValue();
    }

    #loadPage(){ // Private method to change currently displayed content
        this.editor.setValue(this.pageContent[this.page]);
    }
}