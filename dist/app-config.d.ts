export namespace config {
    namespace pages {
        namespace home {
            let path: string;
        }
        namespace simple {
            let path_1: string;
            export { path_1 as path };
        }
        namespace tabstrip {
            let path_2: string;
            export { path_2 as path };
        }
        namespace signin {
            let path_3: string;
            export { path_3 as path };
        }
        namespace signedin {
            let path_4: string;
            export { path_4 as path };
            export let hidden: boolean;
        }
        namespace wizard {
            let path_5: string;
            export { path_5 as path };
        }
        namespace schema {
            let path_6: string;
            export { path_6 as path };
        }
        namespace markDown {
            let path_7: string;
            export { path_7 as path };
        }
        let about: {};
    }
}
