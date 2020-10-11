export class Constants {
  libraryTip =
    "The library code of the given circulation desk or department where the action is being performed";
  circTip =
    "The circulation desk where the action is being performed. Send either this parameter or the department parameter.";
  departmentTip =
    "The department where the action is being performed. Send either this parameter or the circ_desk parameter.";
  workOrderTip =
    "The work order type which is to be performed, or is being performed on the scanned in item.";
  statusTip =
    "The work order status to which we want to move the item. Optional input is defined by the work order type.";
  doneTip =
    "Work order processing is completed on the item. Options: true or false. Only relevant when department parameter is sent.";
  autoPrintSlipTip = "Automatically print a slip. Options: true or false.";
  placeOnHoldShelfTip = "Place on hold shelf. Options: true or false.";
  confirmTip = "Confirm the action on the item. Options: true or false.";
  registerInHouseUseTip = "Register in house uses. Options: true or false.";
  externalIdTip= "External ID. Options: true or false.";
}
