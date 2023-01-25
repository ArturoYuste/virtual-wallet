import { Component, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { TarjetaCredito } from "src/app/models/TarjetaCredito";
import { TarjetaService } from "src/app/services/tarjeta.service";

@Component({
  selector: "app-crear-tarjeta",
  templateUrl: "./crear-tarjeta.component.html",
  styleUrls: ["./crear-tarjeta.component.css"],
})
export class CrearTarjetaComponent implements OnInit {
  form: UntypedFormGroup;
  loading = false;
  titulo = "Agregar Tarjeta";
  id: string | undefined;
  editar = false;

  constructor(
    private fb: UntypedFormBuilder,
    private _tarjetaService: TarjetaService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      titular: ["", Validators.required],
      numeroTarjeta: [
        "",
        [
          Validators.required,
          Validators.minLength(16),
          Validators.maxLength(16),
        ],
      ],
      fechaExpiracion: [
        "",
        [Validators.required, Validators.minLength(5), Validators.maxLength(5)],
      ],
      cvv: [
        "",
        [Validators.required, Validators.minLength(3), Validators.maxLength(3)],
      ],
      fechaCreacion: [""],
    });
  }

  ngOnInit(): void {
    this._tarjetaService.getTarjetaEdit().subscribe((data) => {
      this.editar = true;
      this.id = data.id;
      this.titulo = "Editar Tarjeta";
      this.form.patchValue({
        titular: data.titular,
        numeroTarjeta: data.numeroTarjeta,
        fechaExpiracion: data.fechaExpiracion,
        fechaCreacion: data.fechaCreacion,
        cvv: data.cvv,
        fechaCreacion: data.fechaCreacion,
      });
    });
  }

  guardarTarjeta() {
    if (this.id === undefined) {
      // Creamos una nueva tarjeta
      this.agregarTarjeta();
    } else {
      // Editamos una nueva tarjeta
      this.editarTarjeta(this.id);
    }
  }

  editarTarjeta(id: string) {
    const TARJETA: any = {
      id: id,
      titular: this.form.value.titular,
      numeroTarjeta: this.form.value.numeroTarjeta,
      fechaExpiracion: this.form.value.fechaExpiracion,
      fechaCreacion: this.form.value.fechaCreacion,
      cvv: this.form.value.cvv,
      fechaActualizacion: new Date(),
      fechaCreacion: this.form.value.fechaCreacion,
    };
    this.loading = true;
    this._tarjetaService.editarTarjeta(id, TARJETA).then(
      () => {
        this.loading = false;
        this.titulo = "Agregar Tarjeta";
        this.form.reset();
        this.id = undefined;
        this.toastr.info(
          "La Tarjeta fue actualizada con exito!",
          "Registro Actualizado"
        );
        this._tarjetaService.reloadTarjetas$.next();
        this.editar = false;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  agregarTarjeta() {
    const TARJETA: TarjetaCredito = {
      titular: this.form.value.titular,
      numeroTarjeta: this.form.value.numeroTarjeta,
      fechaExpiracion: this.form.value.fechaExpiracion,
      cvv: this.form.value.cvv,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    this.loading = true;
    this._tarjetaService
      .guardarTarjeta(TARJETA)
      .then(() => {
        this.loading = false;
        console.log("tarjeta registrado");
        this.toastr.success(
          "La tarjeta fue registrada con exito!",
          "Tarjeta registrada"
        );
        this.form.reset();
        this._tarjetaService.reloadTarjetas$.next();
      })
      .catch((error) => {
        this.loading = false;
        this.toastr.error("Opps.. ocurrio un error", "Error");
        console.log(error);
      });
  }

  cancelar() {
    this.form.reset();
    this.id = undefined;
    this.editar = false;
  }
}
