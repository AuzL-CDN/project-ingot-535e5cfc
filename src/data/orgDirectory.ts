// Organization Directory data extracted from ORGDirectory.xlsx
// Column A: Organization - Site Number
// Column B: Organization Name (Company Name)
// Column C: Actual Address (displayed in one line)

export interface OrgDirectoryEntry {
  orgSiteNumber: string;
  companyName: string;
  address: string;
}

export const orgDirectory: OrgDirectoryEntry[] = [
  { orgSiteNumber: "113-0", companyName: "A.U.G. Signals Ltd.", address: "103-73 Richmond Street West Toronto ON M5H4E8" },
  { orgSiteNumber: "118-0", companyName: "ABI/Advanced Business Interiors Inc.", address: "2355 St. Laurent Boulevard Ottawa ON K1G4L2" },
  { orgSiteNumber: "120-0", companyName: "Robert Half Canada Inc.", address: "820-181 Bay Street (Head Office) Toronto ON M5J2T3" },
  { orgSiteNumber: "123-0", companyName: "Accurate Design & Communication Inc.", address: "100-57 Auriga Drive Ottawa ON K2E8B2" },
  { orgSiteNumber: "128-0", companyName: "Action Personnel of Ottawa-Hull Limited", address: "126-130 Albert Street Ottawa ON K1P5G4" },
  { orgSiteNumber: "130-0", companyName: "ADGA Group Consultants Inc.", address: "200-21 Fitzgerald Road Nepean ON K2H9J4" },
  { orgSiteNumber: "130-1", companyName: "ADGA Group Consultants Inc.", address: "7-490 Discovery Avenue Kingston ON K7K7E9" },
  { orgSiteNumber: "130-2", companyName: "ADGA Group Consultants Inc.", address: "100-70 Crémazie Gatineau PQ J8Y3P2" },
  { orgSiteNumber: "132-0", companyName: "Adecco Employment Services Limited", address: "800-20 Bay Street Toronto ON M5J2N8" },
  { orgSiteNumber: "133-0", companyName: "Narayan, Shankar Bellur", address: "308-3099 Carling avenue Nepean ON K2H5A6" },
  { orgSiteNumber: "134-0", companyName: "ADT Security Services Canada, Inc.", address: "518-1250 Old Innes Road Ottawa ON K1B5L3" },
  { orgSiteNumber: "134-1", companyName: "ADT Security Services Canada, Inc.", address: "303 Balmoral St. Winnipeg MB R3C4A8" },
  { orgSiteNumber: "134-2", companyName: "ADT Security Services Canada, Inc.", address: "2815 Matheson Blvd East Mississauga ON L4W4P7" },
  { orgSiteNumber: "137-0", companyName: "AMS Imaging Inc.", address: "17-77 Auriga Drive Ottawa ON K2E7Z7" },
  { orgSiteNumber: "143-0", companyName: "Aerospace Industries Association of Canada", address: "703-255 Albert Street Ottawa ON K1P6A9" },
  { orgSiteNumber: "146-0", companyName: "Azur Human Resources Ltd.", address: "1800-275 Slater Street Ottawa ON K1P5H9" },
  { orgSiteNumber: "148-0", companyName: "Ahearn & Soper Inc.", address: "110-38 Antares Drive Ottawa ON K2E7V2" },
  { orgSiteNumber: "148-1", companyName: "Ahearn & Soper Inc.", address: "110-100 Woodbine Rexdale ON M9W5S6" },
  { orgSiteNumber: "150-0", companyName: "The AIM Group Inc.", address: "126-130 Albert Street Ottawa ON K1P5G4" },
  { orgSiteNumber: "154-0", companyName: "Aircraft Appliances and Equipment Limited", address: "7297 East Danbro Crescent Mississauga ON L5N6P8" },
  { orgSiteNumber: "159-0", companyName: "ABC Benefits Corporation", address: "10009 108 Street NW Edmonton AB T5J3C5" },
  { orgSiteNumber: "159-1", companyName: "ABC Benefits Corporation", address: "10707 100 Avenue Edmonton AB T5J2W3" },
  { orgSiteNumber: "159-2", companyName: "ABC Benefits Corporation", address: "17204 114 Ave. NW Edmonton AB T5S2S9" },
  { orgSiteNumber: "167-0", companyName: "MacRae & Co.", address: "600-222 Somerset Street West Ottawa ON K2P2G3" },
  { orgSiteNumber: "170-0", companyName: "Allan Crawford Associates Limited", address: "5805 Kennedy Road Mississauga ON L4Z2G3" },
  { orgSiteNumber: "180-0", companyName: "Amita Corporation", address: "250-2650 Queensview Drive Ottawa ON K2B8H6" },
  { orgSiteNumber: "189-0", companyName: "Accenture Inc.", address: "1100-150 Elgin Street Ottawa ON K2P1L4" },
  { orgSiteNumber: "189-1", companyName: "Accenture Inc.", address: "400-5450 Explorer Drive Mississauga ON L4W5M1" },
  { orgSiteNumber: "189-2", companyName: "Accenture Inc.", address: "3401 Schmon Pky Thorold ON L2V5A8" },
  { orgSiteNumber: "189-3", companyName: "Accenture Inc.", address: "D-495 Prospect St. Fredericton NB E3B9M4" },
  { orgSiteNumber: "189-4", companyName: "Accenture Inc.", address: "3000-40 King Street West Toronto ON M5H4A9" },
  { orgSiteNumber: "195-0", companyName: "Anthony, Macauley & Associates (Victoria) Inc.", address: "766 Hillside Avenue Victoria BC V8T1Z6" },
  { orgSiteNumber: "201-0", companyName: "Sonovision Canada Inc.", address: "100-179 Colonnade road Ottawa ON K2E7J4" },
  { orgSiteNumber: "201-1", companyName: "Sonovision Canada Inc.", address: "4480 Ch. de la Côte-de-Liesse Mount Royal PQ H4N2R1" },
  { orgSiteNumber: "201-2", companyName: "Sonovision Canada Inc.", address: "212-9348 49th Street NW Edmonton AB T6B2L7" },
  { orgSiteNumber: "202-0", companyName: "Applanix Corporation", address: "85 Leek Crescent Richmond Hill ON L4B3B3" },
  { orgSiteNumber: "206-0", companyName: "AQR Management Services Inc.", address: "1559 Forest Valley Drive Ottawa ON K1C6H9" },
  { orgSiteNumber: "210-0", companyName: "ASL Environmental Sciences Inc.", address: "1-6703 Rajpur Place Victoria BC V8M1Z5" },
  { orgSiteNumber: "217-0", companyName: "Artemp Personnel Services Inc.", address: "126-130 Albert Street Ottawa ON K1P5G4" },
  { orgSiteNumber: "231-0", companyName: "Computer Sciences Canada Inc.", address: "200-1145 Innovation Drive Kanata ON K2K3G5" },
  { orgSiteNumber: "231-1", companyName: "Computer Sciences Canada Inc.", address: "5104 - 82nd AVENUE EDMONTON AB T6B0E6" },
  { orgSiteNumber: "231-2", companyName: "Computer Sciences Canada Inc.", address: "1020 c/o CDC @-68th Ave., N.E. Calgary AB T2E8P2" },
  { orgSiteNumber: "231-3", companyName: "Computer Sciences Canada Inc.", address: "450-55 METCALFE STREET OTTAWA ON K1P6L5" },
  { orgSiteNumber: "232-0", companyName: "Bluedrop Training & Simulation Inc.", address: "300-36 Solutions Drive Halifax NS B3S1N2" },
  { orgSiteNumber: "232-1", companyName: "Bluedrop Training & Simulation Inc.", address: "216-2985 Drew Road Mississauga ON L4T0A4" },
  { orgSiteNumber: "237-0", companyName: "Aubut & Associates Inc.", address: "2nd floor-346 Waverly St Ottawa ON K2P0W5" },
  { orgSiteNumber: "245-0", companyName: "BGE Indoor Air Quality Solutions Ltd.", address: "5711 103 A Street Edmonton AB T6H2J6" },
  { orgSiteNumber: "254-0", companyName: "TANGO - Solutions RH inc.", address: "106-394 boul. Maloney Ouest Gatineau PQ J8P6W2" },
  { orgSiteNumber: "274-0", companyName: "Bell Canada", address: "410-78 O'Connor Street Ottawa ON K1P5M7" }
  // Note: This is a subset of the full directory. Add more entries as needed.
];