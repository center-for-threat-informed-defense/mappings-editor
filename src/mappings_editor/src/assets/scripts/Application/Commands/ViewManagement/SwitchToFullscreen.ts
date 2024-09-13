import { AppCommand } from "../AppCommand";

export class SwitchToFullscreen extends AppCommand {

    /**
     * Switches the application to fullscreen mode.
     * @param context
     *  The application context.
     */
    constructor() {
        super();
    }

    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        const cast = document.body as any;
        if (cast.requestFullscreen) {
            cast.requestFullscreen();
        } else if (cast.webkitRequestFullscreen) {
            // Safari
            cast.webkitRequestFullscreen();
        } else if (cast.msRequestFullscreen) {
            // IE11
            cast.msRequestFullscreen();
        }
    }

}
