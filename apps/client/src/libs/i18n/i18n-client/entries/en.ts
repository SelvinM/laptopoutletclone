import enMessages from "../messages/en.json";
import enAntD from "antd/lib/locale/en_US";
import { Locale } from "@laptopoutlet-packages/types";
const EN_LANG = {
  messages: {
    ...enMessages,
  },
  locale: Locale.En,
  name: "english",
  antdLocale: enAntD,
};
export default EN_LANG;
