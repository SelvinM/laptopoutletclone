type MUNICIPALITY = {
	label: string;
	city: string;
	zipcode: string;
};
type DEPARTMENT = {
	province: string;
	data: MUNICIPALITY[];
};

export const PLACES: DEPARTMENT[] = [
	{
		province: "Atlántida",
		data: [
			{ label: "La Ceiba", city: "La Ceiba", zipcode: "31101" },
			{ label: "Tela", city: "Tela", zipcode: "31301" },
			{ label: "El Porvenir", city: "El Porvenir", zipcode: "00001" },
		],
	},
	{
		province: "Choluteca",
		data: [
			{ label: "Choluteca", city: "Choluteca", zipcode: "51101" },
			{
				label: "San Marcos de Colón",
				city: "San Marcos de Colón",
				zipcode: "00002",
			},
			{ label: "Pespire", city: "Pespire", zipcode: "51201" },
		],
	},
	{
		province: "Colón",
		data: [
			{ label: "Sonaguera", city: "Sonaguera", zipcode: "00003" },
			{ label: "Tocoa", city: "Tocoa", zipcode: "32301" },
			{ label: "Bonito Oriental", city: "Bonito Oriental", zipcode: "00004" },
			{ label: "Trujillo", city: "Trujillo", zipcode: "32101" },
			{ label: "Sabá", city: "Sabá", zipcode: "00005" },
		],
	},
	{
		province: "Comayagua",
		data: [
			{ label: "Comayagua", city: "Comayagua", zipcode: "12100" },
			{ label: "Siguatepeque", city: "Siguatepeque", zipcode: "12111" },
			{ label: "Taulabé", city: "Taulabé", zipcode: "00006" },
		],
	},
	{
		province: "Copán",
		data: [
			{
				label: "Santa Rosa de Copán",
				city: "Santa Rosa de Copán",
				zipcode: "41101",
			},
			{ label: "Copán Ruinas", city: "Copán Ruinas", zipcode: "00007" },
			{ label: "La Entrada", city: "La Entrada", zipcode: "41202" },
			{ label: "Florida", city: "Florida", zipcode: "00008" },
			{ label: "Santa Rita", city: "Santa Rita", zipcode: "00009" },
			{ label: "Cucuyagua", city: "Cucuyagua", zipcode: "00010" },
		],
	},
	{
		province: "Cortés",
		data: [
			{
				label: "San Pedro Sula, Sector N.E.",
				city: "San Pedro Sula",
				zipcode: "21101",
			},
			{
				label: "San Pedro Sula, Sector N.O.",
				city: "San Pedro Sula",
				zipcode: "21102",
			},
			{
				label: "San Pedro Sula, Sector S.E.",
				city: "San Pedro Sula",
				zipcode: "21103",
			},
			{
				label: "San Pedro Sula, Sector S.O.",
				city: "San Pedro Sula",
				zipcode: "21104",
			},
			{ label: "Puerto Cortés", city: "Puerto Cortés", zipcode: "21301" },
			{ label: "Choloma", city: "Choloma", zipcode: "21112" },
			{ label: "La Lima", city: "La Lima", zipcode: "00011" },
			{ label: "Villanueva", city: "Villanueva", zipcode: "00012" },
			{ label: "Potrerillos", city: "Potrerillos", zipcode: "00013" },
			{
				label: "Santa Cruz de Yojoa",
				city: "Santa Cruz de Yojoa",
				zipcode: "00014",
			},
			{ label: "Omoa", city: "Omoa", zipcode: "00015" },
		],
	},
	{
		province: "El Paraíso",
		data: [
			{ label: "Yuscarán", city: "Yuscarán", zipcode: "13101" },
			{ label: "Danlí", city: "Danlí", zipcode: "13201" },
			{ label: "El Paraíso", city: "El Paraíso", zipcode: "00016" },
		],
	},
	{
		province: "Francisco Morazán",
		data: [
			{ label: "Tegucigalpa", city: "Tegucigalpa", zipcode: "11101" },
			{ label: "Comayagüela", city: "Comayagüela", zipcode: "12101" },
			{ label: "Valle de Ángeles", city: "Valle de Ángeles", zipcode: "00017" },
			{ label: "Talanga", city: "Talanga", zipcode: "00018" },
			{ label: "Guaimaca", city: "Guaimaca", zipcode: "00019" },
			{ label: "Sabanagrande", city: "Sabanagrande", zipcode: "00020" },
			{ label: "La Venta", city: "La Venta", zipcode: "00021" },
			{ label: "Ojojona", city: "Ojojona", zipcode: "00022" },
			{
				label: "San Juan de Flores",
				city: "San Juan de Flores",
				zipcode: "00023",
			},
		],
	},
	{
		province: "Gracias a Dios",
		data: [
			{ label: "Puerto Lempira", city: "Puerto Lempira", zipcode: "33101" },
		],
	},
	{
		province: "Intibucá",
		data: [
			{ label: "La Esperanza", city: "La Esperanza", zipcode: "14101" },
			{ label: "Jesus de Otoro", city: "Jesus de Otoro", zipcode: "14201" },
		],
	},
	{
		province: "Islas de la Bahía",
		data: [{ label: "Roatán", city: "Roatán", zipcode: "34101" }],
	},
	{
		province: "La Paz",
		data: [
			{ label: "La Paz", city: "La Paz", zipcode: "15101" },
			{ label: "Marcala", city: "Marcala", zipcode: "15201" },
		],
	},
	{
		province: "Lempira",
		data: [
			{ label: "Gracias", city: "Gracias", zipcode: "42101" },
			{ label: "Erandique", city: "Erandique", zipcode: "42201" },
			{ label: "Lapaera", city: "Lapaera", zipcode: "00024" },
		],
	},
	{
		province: "Ocotepeque",
		data: [
			{ label: "Ocotepeque", city: "Ocotepeque", zipcode: "43101" },
			{
				label: "San Marcos de Ocotepeque",
				city: "San Marcos de Ocotepeque",
				zipcode: "43201",
			},
		],
	},
	{
		province: "Olancho",
		data: [
			{ label: "Juticalpa", city: "Juticalpa", zipcode: "16101" },
			{ label: "Catacamas", city: "Catacamas", zipcode: "16201" },
			{ label: "Campamento", city: "Campamento", zipcode: "00025" },
		],
	},
	{
		province: "Santa Bárbara",
		data: [
			{ label: "Santa Bárbara", city: "Santa Bárbara", zipcode: "22101" },
			{ label: "Trinidad", city: "Trinidad", zipcode: "22114" },
		],
	},
	{
		province: "Valle",
		data: [
			{ label: "Nacaome", city: "Nacaome", zipcode: "52101" },
			{ label: "San Lorenzo", city: "San Lorenzo", zipcode: "52102" },
		],
	},
	{
		province: "Yoro",
		data: [
			{ label: "Yoro", city: "Yoro", zipcode: "23101" },
			{ label: "El Progreso", city: "El Progreso", zipcode: "23201" },
			{ label: "Santa Rita", city: "Santa Rita", zipcode: "00026" },
			{ label: "Morazán", city: "Morazán", zipcode: "00027" },
			{ label: "El Negrito", city: "El Negrito", zipcode: "00028" },
			{ label: "Olanchito", city: "Olanchito", zipcode: "00029" },
		],
	},
];
export const DEPARTMENTS = [
	"Atlántida",
	"Choluteca",
	"Colón",
	"Comayagua",
	"Copán",
	"Cortés",
	"El Paraíso",
	"Francisco Morazán",
	"Gracias a Dios",
	"Intibucá",
	"Islas de la Bahía",
	"La Paz",
	"Lempira",
	"Ocotepeque",
	"Olancho",
	"Santa Bárbara",
	"Valle",
	"Yoro",
];
