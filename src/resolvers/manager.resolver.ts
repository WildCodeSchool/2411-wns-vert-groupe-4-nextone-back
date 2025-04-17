import UserService from "@/services/manager.service";
  
export default {
    Mutation: {
        register: async (_: any, { infos }: any) => { //?
        const user = await new UserService().findUserByEmail(infos.email);
        if (user) {
            throw new Error("Cet email est déjà pris!");
        }
        const newUser = await new UserService().createUser(infos);
        return newUser;
        },
    },
};