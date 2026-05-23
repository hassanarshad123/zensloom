import { getCurrentUser } from "@zensloom/database/auth/session";
import { cache } from "react";

export const getUser = cache(getCurrentUser);
