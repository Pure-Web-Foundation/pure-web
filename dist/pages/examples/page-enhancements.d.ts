export class PageEnhancements {
    static get properties(): {
        readyToRenderTimeBasedDropDown: {
            type: BooleanConstructor;
        };
    };
    render(): any;
    firstUpdated(): void;
    readyToRenderTimeBasedDropDown: boolean | undefined;
    renderTimeBasedDropDown(): any;
    get autoCompleteOptions(): {
        categories: {
            Site: {
                trigger: (options: any) => boolean;
                action: (options: any) => void;
                getItems: () => any;
            };
            Search: {
                trigger: (options: any) => boolean;
                getItems: (options: any) => {
                    text: string;
                    description: string;
                    icon: string;
                }[];
            };
        };
    };
}
