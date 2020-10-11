export class Configuration {
  mustConfig = {
    library: "",
    work_order_type: "",
    confirm: false,
    place_on_hold_shelf: false,
    auto_print_slip: false,
    register_in_house_use: true,
    external_id: false,
  };
  from: { circ_desk?: string; department?: string } = { circ_desk: "", department: "" };

  departmentArgs: { done: boolean } = { done: false };
}
