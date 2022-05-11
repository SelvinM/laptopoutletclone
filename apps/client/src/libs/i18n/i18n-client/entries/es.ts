import saMessages from "../messages/es.json";
import esAntD from "antd/lib/locale/es_ES";
import { Locale } from "@laptopoutlet-packages/types";
const ES_LANG = {
  messages: {
    ...saMessages,
  },
  locale: Locale.Es,
  name: "spanish",
  antdLocale: esAntD,
};
export default ES_LANG;
