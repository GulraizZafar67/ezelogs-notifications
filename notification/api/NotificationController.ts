import {NotificationHandler} from "../core/handlers/NotificationHandler";
import {inject, injectable} from "inversify";
import {controller, httpPost, request, response} from "inversify-express-utils";
import {Request,Response} from "express";

@controller('/')
export class NotificationController {

    private notificationHandler: NotificationHandler;

    constructor(@inject(NotificationHandler) notificationHandler: NotificationHandler) {
        this.notificationHandler = notificationHandler;
    }

    @httpPost("notifications")
    async handleNotification(@request() req: Request,@response() res:Response): Promise<void> {
       try{
           const result = await this.notificationHandler.handleNotification(req)
           res.status(200).send(result)
       }
       catch (e) {
              console.error("error",e)

           res.status(500).send({
               success:false,
               message:"Internal server error"
           })
       }
    }


}
