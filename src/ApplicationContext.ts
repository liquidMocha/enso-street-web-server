import {OrderRepository} from "./order/OrderRepository";
import {SameProcessUserAdaptor} from "./order/SameProcessUserAdaptor";
import {SameProcessUserProfilePorts} from "./userprofile/SameProcessUserProfilePorts";

export const sameProcessUserAdaptor = new SameProcessUserAdaptor(new SameProcessUserProfilePorts());

export const sameProcessOrderRepository = new OrderRepository(sameProcessUserAdaptor);
