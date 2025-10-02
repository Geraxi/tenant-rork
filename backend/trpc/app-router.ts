import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import signinRoute from "./routes/auth/signin/route";
import meRoute from "./routes/auth/me/route";
import updateProfileRoute from "./routes/user/update-profile/route";
import switchModeRoute from "./routes/user/switch-mode/route";
import createPropertyRoute from "./routes/properties/create/route";
import listPropertiesRoute from "./routes/properties/list/route";
import myListingsRoute from "./routes/properties/my-listings/route";
import swipeMatchRoute from "./routes/matches/swipe/route";
import listMatchesRoute from "./routes/matches/list/route";
import sendMessageRoute from "./routes/messages/send/route";
import { createContractProcedure } from "./routes/contracts/create/route";
import { listContractsProcedure } from "./routes/contracts/list/route";
import { signContractProcedure } from "./routes/contracts/sign/route";
import { getContractProcedure } from "./routes/contracts/get/route";
import { registerContractWithAgenziaEntrateProcedure } from "./routes/contracts/register-agenzia-entrate/route";
import { submitVerificationProcedure } from "./routes/verification/submit/route";
import { getVerificationStatusProcedure } from "./routes/verification/status/route";
import { requestBackgroundCheckProcedure, getBackgroundCheckStatusProcedure } from "./routes/background-check/request/route";
import { addVirtualTourProcedure, getVirtualToursProcedure } from "./routes/virtual-tours/manage/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    signin: signinRoute,
    me: meRoute,
  }),
  user: createTRPCRouter({
    updateProfile: updateProfileRoute,
    switchMode: switchModeRoute,
  }),
  properties: createTRPCRouter({
    create: createPropertyRoute,
    list: listPropertiesRoute,
    myListings: myListingsRoute,
  }),
  matches: createTRPCRouter({
    swipe: swipeMatchRoute,
    list: listMatchesRoute,
  }),
  messages: createTRPCRouter({
    send: sendMessageRoute,
  }),
  contracts: createTRPCRouter({
    create: createContractProcedure,
    list: listContractsProcedure,
    get: getContractProcedure,
    sign: signContractProcedure,
    registerWithAgenziaEntrate: registerContractWithAgenziaEntrateProcedure,
  }),
  verification: createTRPCRouter({
    submit: submitVerificationProcedure,
    status: getVerificationStatusProcedure,
  }),
  backgroundCheck: createTRPCRouter({
    request: requestBackgroundCheckProcedure,
    status: getBackgroundCheckStatusProcedure,
  }),
  virtualTours: createTRPCRouter({
    add: addVirtualTourProcedure,
    list: getVirtualToursProcedure,
  }),
});

export type AppRouter = typeof appRouter;