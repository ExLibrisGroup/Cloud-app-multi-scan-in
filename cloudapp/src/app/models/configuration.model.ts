// work_order_type: "",
export class Configuration {
  mustConfig = {
    library: "",
    confirm: false,
    auto_print_slip: false,
    register_in_house_use: true,
    external_id: false,
    work_order_type: "",
    status: "",
    done: false,
  };
  from: { circ_desk?: string; department?: string } = {
    circ_desk: "",
    department: "",
  };

  departmentArgs: { done: boolean } = { done: false };
  circArgs: { place_on_hold_shelf: boolean } = { place_on_hold_shelf: false };
}
