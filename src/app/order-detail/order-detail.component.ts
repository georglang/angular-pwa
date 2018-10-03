import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IndexDBService } from '../service/index-db.service';
import { DateAdapter } from '@angular/material';
import { TimeRecord } from '../data-classes/time-record';
import { Order } from '../data-classes/order';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.sass']
})
export class OrderDetailComponent implements OnInit {
  private paramId;
  private sub;

  public timeRecordForm: FormGroup;
  public createRecordForm: FormGroup;
  public columns: string[];
  public totalTime = 0.0;
  private order: Order;

  public form_validation_messages = {
    customer: [{ type: 'required', message: 'Bitte Kunde eintragen' }],
    description: [{ type: 'required', message: 'Bitte Art der Arbeit eintragen' }],
    time: [{ type: 'required', message: 'Bitte Stunden eintragen' }]
  };

  public addRecord(record: TimeRecord) {
    this.indexDbService.addRecord(record);
    // this.addRecord.emit(this.title);
  }

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    private indexDbService: IndexDBService
  ) {
    this.dateAdapter.setLocale('de');
    this.columns = ['Date', 'Customer', 'Description', 'Time', 'Delete'];

    this.timeRecordForm = this.formBuilder.group({
      time_records: this.formBuilder.array([
        this.formBuilder.group({
          date: ['', Validators.required],
          customer: ['', Validators.required],
          description: ['', Validators.required],
          time: [0, Validators.required]
        })
      ])
    });
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.paramId = +params['id']; // (+) converts string 'id' to a number
    });
    console.log('ID: ', this.paramId);

    this.createRecordForm = this.formBuilder.group({
      customer: []
    });

    console.log('TOTAL TIME', this.totalTime);

    this.timeRecords.valueChanges.subscribe(change => {
      let tempTotalTime = 0.0;
      change.forEach(record => {
        //console.log('Value', record.time);
        tempTotalTime += record.time;
      });
      this.totalTime = tempTotalTime;
    });
  }

  public addControl() {
    const control = <FormArray>this.timeRecordForm.controls.time_records;
    control.push(
      this.formBuilder.group({
        date: ['', Validators.required],
        customer: ['', Validators.required],
        description: ['', Validators.required],
        time: [0, Validators.required]
      })
    );
    console.log('Control', control);
  }

  public onSubmit() {
    // const _tempArray = this.timeRecordForm.controls.time_records as FormArray;
    const recordsFromFormInput = this.timeRecordForm.controls.time_records.value;
    recordsFromFormInput.forEach(record => {
      this.indexDbService.addRecord(record);
      this.indexDbService.addRecordToOrder(record, this.paramId);
    });
  }

   // Database Operations

   public insertRecord() {
    console.log('Record', this.indexDbService.insertOneRecord());
  }
  get timeRecords() {
    // console.log('Time Records', this.timeRecordForm.get(
    //   'time_records'
    // ) as FormArray);
    return this.timeRecordForm.get('time_records') as FormArray;
  }

  public getRecordsFromDb() {
    // this.indexDbService. .getAllOrders();
  }

  public getOrders() {
    this.indexDbService.getAllOrders().then((data) => {
      console.log('Orders', data);
    });
  }

  public getOrderById() {
    this.indexDbService.getOrderById(this.paramId).then((order) => {
      this.order = order[0];
      console.log('Order By ID', this.order);
    });
  }

  public getItems() {
    // console.log('Records', this.timeRecordForm.value as FormArray);
    // console.log('Single Record', this.timeRecordForm.value
    // .time_records as FormArray);
  }

}
