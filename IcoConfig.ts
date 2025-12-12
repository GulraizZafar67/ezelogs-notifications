import {Container} from 'inversify';
import {NotificationHandler} from "./notification/core/handlers/NotificationHandler";
import {NotificationController} from "./notification/api/NotificationController";

const container = new Container()


container.bind<NotificationHandler>(NotificationHandler).toSelf()
container.bind<NotificationController>(NotificationController).toSelf()
export {container};
