@echo off

mkdir dist

set GOOS=linux
go build -o dist\op-fw-dutyhours

set GOOS=windows